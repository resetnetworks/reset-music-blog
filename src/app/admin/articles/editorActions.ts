"use server";

import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import { revalidatePath } from "next/cache";
import { generateUploadUrl } from "@/services/s3";

export async function getPresignedUrlAction(fileType: string) {
  return await generateUploadUrl(fileType);
}

export async function saveArticleAction(formData: FormData) {
  try {
    await dbConnect();
    
    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const coverImage = formData.get("coverImage") as string;
    const authorId = formData.get("authorId") as string;
    const categoryId = formData.get("categoryId") as string;
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const publishStatus = formData.get("publishStatus") as string;
    const featured = formData.get("featured") === "true";
    const tagIds = JSON.parse(formData.get("tagIds") as string || "[]");

    // Basic reading time calculation
    const words = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const articleData = {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author: authorId,
      category: categoryId,
      seoTitle,
      seoDescription,
      publishStatus,
      featured,
      tags: tagIds,
      readingTime,
    };

    if (id) {
      // Check if slug exists but belongs to another article
      const existing = await Article.findOne({ slug, _id: { $ne: id } });
      if (existing) return { error: "Slug already exists" };

      const oldArticle = await Article.findById(id);
      if (publishStatus === "published" && oldArticle?.publishStatus !== "published") {
        (articleData as any).publishedAt = new Date();
      }

      await Article.findByIdAndUpdate(id, articleData);
    } else {
      const existing = await Article.findOne({ slug });
      if (existing) return { error: "Slug already exists" };

      if (publishStatus === "published") {
        (articleData as any).publishedAt = new Date();
      }

      await Article.create(articleData);
    }

    revalidatePath("/admin/articles");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save article" };
  }
}
