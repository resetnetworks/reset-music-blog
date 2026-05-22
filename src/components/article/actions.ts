"use server";

import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";

export async function incrementViewCount(id: string) {
  try {
    await dbConnect();
    await Article.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  } catch (error) {
    console.error("Failed to increment view count", error);
  }
}
