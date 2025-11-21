import fs from "fs/promises";
import AsyncHandler from "express-async-handler";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import ScanService from "../services/ai.service.js";
import FileUploadService from "../services/fileUpload.service.js";
import Scan from "../model/scan.model.js";

const extractResumeText = async (filePath, mimetype) => {
  switch (mimetype) {
    case "text/plain": {
      return fs.readFile(filePath, "utf-8");
    }
    case "application/pdf": {
      const buffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: buffer });
      try {
        const { text } = await parser.getText();
        return text;
      } finally {
        await parser.destroy().catch(() => {});
      }
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const buffer = await fs.readFile(filePath);
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    }
    default:
      throw new Error("Unsupported resume file type for text extraction.");
  }
};

const SKILL_STOP_WORDS = new Set(["js", "javascript", "framework", "library"]);
const normalizeToken = (token = "") =>
  token
    .replace(/(\.js|js)$/i, "")
    .replace(/[^a-z0-9+]/gi, "")
    .toLowerCase()
    .trim();

const tokenizeSkill = (skill = "") => {
  const tokens = skill
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

  const normalized = tokens
    .map(normalizeToken)
    .filter((token) => token && !SKILL_STOP_WORDS.has(token));

  return normalized.length ? normalized : tokens;
};

const skillsEquivalent = (a, b) => {
  if (!a || !b) return false;
  const tokensA = tokenizeSkill(a);
  const tokensB = tokenizeSkill(b);
  if (!tokensA.length || !tokensB.length) return false;

  const subset = (source, targetSet) => source.every((token) => targetSet.has(token));
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  return subset(tokensA, setB) || subset(tokensB, setA);
};

const toStringArray = (value) => {
  const normalizeEntry = (entry) => {
    if (entry == null) return null;
    if (typeof entry === "string") return entry.trim();
    if (typeof entry === "object") return JSON.stringify(entry);
    return String(entry);
  };

  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") {
          return entry.trim();
        }

        if (typeof entry === "object") {
          return JSON.stringify(entry);
        }

        return String(entry);
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return toStringArray(parsed);
    } catch {
      return value
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }

  return [normalizeEntry(value)].filter(Boolean);
};

const matchJDandResume = AsyncHandler(async (req, res) => {
  const { jobDescription, user } = req.body;

  console.info("[SCAN] Incoming match request", {
    userId: (req.user?.id || user)?.toString(),
    jobDescriptionLength: jobDescription?.length,
    fileName: req.file?.originalname,
    mimeType: req.file?.mimetype,
  });
  console.time("scan_pipeline");

  const userId = req.user?.id || user;
  if (!userId) {
    console.timeEnd("scan_pipeline");
    return res.status(400).json({
      success: false,
      message: "User is required.",
    });
  }

  if (!jobDescription) {
    console.timeEnd("scan_pipeline");
    return res.status(400).json({
      success: false,
      message: "Job description is required.",
    });
  }

  if (!req.file) {
    console.timeEnd("scan_pipeline");
    return res.status(400).json({
      success: false,
      message: "Resume file is required. Send it as form-data with key 'resume'.",
    });
  }

  let resumeText = "";
  try {
    resumeText = (await extractResumeText(req.file.path, req.file.mimetype)).trim();
    console.info("[SCAN] Resume text extracted", {
      resumeChars: resumeText.length,
      fileStoredAt: req.file.path,
    });
    if (!resumeText) {
      throw new Error("Unable to read resume content. Please upload a text-based resume.");
    }
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    console.timeEnd("scan_pipeline");
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to read resume content.",
    });
  }

  let resumeFileUrl;
  try {
    resumeFileUrl = await FileUploadService.uploadFile(req.file.path);
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }

  const [jdSkills, resumeSkills] = await Promise.all([
    ScanService.extractSkillsFromJD(jobDescription),
    ScanService.extractSkillsFromResume(resumeText),
  ]);
  console.info("[SCAN] Skills extracted", {
    jdSkills: jdSkills.length,
    resumeSkills: resumeSkills.length,
  });

  const matchedSkills = [];
  const missingKeywords = [];

  jdSkills.forEach((jdSkill) => {
    const hasMatch = resumeSkills.some((resumeSkill) => skillsEquivalent(jdSkill, resumeSkill));
    if (hasMatch) matchedSkills.push(jdSkill);
    else missingKeywords.push(jdSkill);
  });

  const score = jdSkills.length ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 0;

  const topResumeHighlights = resumeSkills.slice(0, 5);
  const resumeSummary = topResumeHighlights.length
    ? `[${topResumeHighlights.join(", ")}${resumeSkills.length > 5 ? ", …" : ""}]`
    : "[]";

  const missingKeywordReasons =
    missingKeywords.length > 0
      ? [
          `Missing ${missingKeywords.join(", ")}: The job description calls these out, but your resume highlights ${resumeSummary}`,
        ]
      : [];

  let improvedResumeContent = resumeText;
  let rewriteSuggestions = [];
  let objective = "";
  let experience = [];
  let education = [];
  let skillsTechnical = [];
  let skillsSoft = [];
  let projects = [];

  try {
    const summary = await ScanService.summarizeResume(resumeText);
    objective = summary.objective || objective;
    experience = toStringArray(summary.experience) || experience;
    education = toStringArray(summary.education) || education;
    skillsTechnical = toStringArray(summary.skillsTechnical) || skillsTechnical;
    skillsSoft = toStringArray(summary.skillsSoft) || skillsSoft;
    projects = toStringArray(summary.projects) || projects;
  } catch (error) {
    console.error("Resume summarize failed:", error.message || error);
  }

  if (missingKeywords.length > 0) {
    try {
      const rewriteResult = await ScanService.rewriteResume({
        resumeText,
        jobDescription,
        missingKeywords,
      });
      improvedResumeContent = rewriteResult.improvedResume || resumeText;
      rewriteSuggestions = toStringArray(rewriteResult.suggestions);
      objective = rewriteResult.objective || objective;
      experience = toStringArray(rewriteResult.experience);
      education = toStringArray(rewriteResult.education);
      skillsTechnical = toStringArray(rewriteResult.skillsTechnical);
      skillsSoft = toStringArray(rewriteResult.skillsSoft);
      projects = toStringArray(rewriteResult.projects);
    } catch (error) {
      console.error("Resume rewrite failed:", error.message || error);
    }
  }

  const scanRecord = await Scan.create({
    user: userId,
    resumeFileUrl,
    jobDescription,
    jdSkills,
    resumeSkills,
    matchScore: score,
    missingKeywords,
    missingKeywordReasons,
    rewriteSuggestions,
    improvedResumeContent,
    objective,
    experience,
    education,
    skillsTechnical,
    skillsSoft,
    projects,
    status: "success",
  });

  res.status(200).json({
    success: true,
    data: {
      scanId: scanRecord._id,
      resumeFileUrl,
      jdSkills,
      resumeSkills,
      matchedSkills,
      missingKeywords,
      missingKeywordReasons,
      score,
      originalResumeContent: resumeText,
      objective,
      experience,
      education,
      skillsTechnical,
      skillsSoft,
      projects,
      rewriteSuggestions,
      improvedResumeContent,
    },
  });
  console.timeEnd("scan_pipeline");
  console.info("[SCAN] Response sent", { scanId: scanRecord._id, score, missingKeywords: missingKeywords.length });
});

export default { matchJDandResume };
