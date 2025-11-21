import ScanServiceAI from "./ai.service.js";

class JDParserService {
  async parseJD(jobDescription) {
    const skills = await ScanServiceAI.extractSkillsFromJD(jobDescription);
    // Can add experience, location extraction later
    return { skills };
  }
}

export default new JDParserService();
