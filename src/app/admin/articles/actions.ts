"use server";

import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import { revalidatePath } from "next/cache";

export async function deleteArticleAction(id: string) {
  try {
    await dbConnect();
    await Article.findByIdAndDelete(id);
    revalidatePath("/admin/articles");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete article" };
  }
}
