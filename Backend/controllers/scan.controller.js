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

const matchJDandResume = AsyncHandler(async (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({
      success: false,
      message: "Job description is required.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Resume file is required. Send it as form-data with key 'resume'.",
    });
  }

  let resumeText = "";
  try {
    resumeText = (await extractResumeText(req.file.path, req.file.mimetype)).trim();
    if (!resumeText) {
      throw new Error("Unable to read resume content. Please upload a text-based resume.");
    }
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
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
    experience = summary.experience || experience;
    education = summary.education || education;
    skillsTechnical = summary.skillsTechnical || skillsTechnical;
    skillsSoft = summary.skillsSoft || skillsSoft;
    projects = summary.projects || projects;
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
      rewriteSuggestions = rewriteResult.suggestions || [];
      objective = rewriteResult.objective || "";
      experience = rewriteResult.experience || [];
      education = rewriteResult.education || [];
      skillsTechnical = rewriteResult.skillsTechnical || [];
      skillsSoft = rewriteResult.skillsSoft || [];
      projects = rewriteResult.projects || [];
    } catch (error) {
      console.error("Resume rewrite failed:", error.message || error);
    }
  }

  const scanRecord = await Scan.create({
    user: req.user?.id,
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
});

export default { matchJDandResume };
