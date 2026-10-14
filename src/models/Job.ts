import mongoose from "mongoose";

export interface IJob {
  _id?: string;
  title: string;
  slug: string;
  department: string;
  type: string;
  locationType: string;
  location: string;
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  applyUrl?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  customQuestions?: {
    id: string;
    question: string;
    type: "text" | "textarea" | "select" | "boolean";
    options?: string[];
    required: boolean;
  }[];
  atsKeywords?: string[];
  status: "active" | "draft" | "closed";
  datePosted?: Date;
  validThrough?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    department: { type: String, required: true, trim: true },
    type: { type: String, required: true, default: "Full-time" },
    locationType: { type: String, required: true, default: "On-site" },
    location: { type: String, required: true, default: "Malviya Nagar, New Delhi" },
    experience: { type: String, required: true, default: "Fresher" },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    applyUrl: { type: String, default: "" },
    customQuestions: [
      {
        _id: false,
        id: { type: String, required: true },
        question: { type: String, required: true },
        type: { type: String, enum: ["text", "textarea", "select", "boolean"], default: "text" },
        options: [{ type: String }],
        required: { type: Boolean, default: false },
      },
    ],
    atsKeywords: [{ type: String, trim: true }],
    salary: {
      min: { type: Number, default: 20000 },
      max: { type: Number },
      currency: { type: String, default: "INR" },
      period: { type: String, default: "MONTH" },
    },
    status: {
      type: String,
      enum: ["active", "draft", "closed"],
      default: "active",
      index: true,
    },
    datePosted: { type: Date, default: Date.now },
    validThrough: { type: Date },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
