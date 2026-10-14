import mongoose from "mongoose";

export interface IApplication {
  _id?: string;
  job: mongoose.Types.ObjectId;
  candidate: {
    name: string;
    email: string;
    phone: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
  };
  resumeUrl: string;
  resumeFileName?: string;
  resumeText?: string;
  answers: {
    questionId: string;
    question: string;
    answer: string;
  }[];
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  status: "new" | "reviewed" | "shortlisted" | "interview" | "rejected" | "hired";
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    candidate: {
      name: { type: String, trim: true, default: "Applicant" },
      email: { type: String, trim: true, lowercase: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      portfolioUrl: { type: String, default: "" },
      linkedinUrl: { type: String, default: "" },
    },
    resumeUrl: { type: String, required: true },
    resumeFileName: { type: String, default: "resume.pdf" },
    resumeText: { type: String, default: "" },
    answers: [
      {
        _id: false,
        questionId: { type: String, required: true },
        question: { type: String, required: true },
        answer: { type: String, default: "" },
      },
    ],
    atsScore: { type: Number, default: 0, index: true },
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    status: {
      type: String,
      enum: ["new", "reviewed", "shortlisted", "interview", "rejected", "hired"],
      default: "new",
      index: true,
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema);
