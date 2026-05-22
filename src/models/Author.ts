import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: { type: String },
    avatar: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Author || mongoose.model("Author", AuthorSchema);
