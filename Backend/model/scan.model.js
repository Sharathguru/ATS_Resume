import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resumeFileUrl: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    jdSkills: {
      type: [String],
      default: [],
    },
    resumeSkills: {
      type: [String],
      default: [],
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    missingKeywordReasons: {
      type: [String],
      default: [],
    },
    rewriteSuggestions: {
      type: [String],
      default: [],
    },
    improvedResumeContent: {
      type: String,
      default: "",
    },
    objective: {
      type: String,
      default: "",
    },
    experience: {
      type: [String],
      default: [],
    },
    education: {
      type: [String],
      default: [],
    },
    skillsTechnical: {
      type: [String],
      default: [],
    },
    skillsSoft: {
      type: [String],
      default: [],
    },
    projects: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

const Scan = mongoose.model("Scan", scanSchema);

export default Scan;
