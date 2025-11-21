import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class ScanServiceAI {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY missing in .env");
    }
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async extractSkillsFromJD(jobDescription) {
    if (!jobDescription) throw new Error("jobDescription is required");
    return this.extractSkillsFromText(
      `Extract only hard skills or technologies mentioned in the following JOB DESCRIPTION. Respond with a JSON array of strings and nothing else.\n\n${jobDescription}`
    );
  }

  async extractSkillsFromResume(resumeText) {
    if (!resumeText) throw new Error("resumeText is required");
    return this.extractSkillsFromText(
      `Extract only hard skills or technologies mentioned in the following RESUME. Respond with a JSON array of strings and nothing else.\n\n${resumeText}`
    );
  }

  async summarizeResume(resumeText) {
    if (!resumeText) return {};
    const prompt = `Summarize this resume into JSON with keys objective (string), experience (array of bullet strings), education (array), skillsTechnical (array), skillsSoft (array), projects (array). Keep each entry concise but specific.\n\n${resumeText}`;
    const raw = await this.callLLM(prompt);
    return this.safeJSONParse(raw, {});
  }

  async rewriteResume({ resumeText, jobDescription, missingKeywords }) {
    const prompt = `You are optimizing a resume for ATS. Rewrite the resume content so it better aligns with the job description while staying truthful.\nReturn JSON with keys: improvedResume (string), suggestions (array of strings), objective (string), experience (array), education (array), skillsTechnical (array), skillsSoft (array), projects (array).\nMake sure to naturally include these missing keywords when appropriate: ${missingKeywords.join(
      ", "
    )}.\nResume:\n${resumeText}\nJob Description:\n${jobDescription}`;
    const raw = await this.callLLM(prompt);
    return this.safeJSONParse(raw, {
      improvedResume: resumeText,
      suggestions: [],
    });
  }

  async extractSkillsFromText(prompt) {
    const raw = await this.callLLM(prompt);
    const parsed = this.safeJSONParse(raw, []);
    if (Array.isArray(parsed)) return parsed.map((item) => item.trim());
    if (typeof parsed === "string") {
      return parsed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  async callLLM(prompt) {
    const response = await this.client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.25,
    });
    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty response from OpenAI");
    return raw;
  }

  safeJSONParse(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      const match = value.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return fallback;
        }
      }
      return fallback;
    }
  }
}

export default new ScanServiceAI();
