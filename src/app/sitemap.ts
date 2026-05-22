import { MetadataRoute } from "next";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Category from "@/models/Category";
import Tag from "@/models/Tag";

const BASE_URL = "https://resetmusic.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await dbConnect();

    const [articles, categories, tags] = await Promise.all([
      Article.find({ publishStatus: "published" }).lean(),
      Category.find().lean(),
      Tag.find().lean(),
    ]);

    const articleUrls = articles.map((a: any) => ({
      url: `${BASE_URL}/blog/${a.slug}`,
      lastModified: new Date(a.updatedAt || a.publishedAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const categoryUrls = categories.map((c: any) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    const tagUrls = tags.map((t: any) => ({
      url: `${BASE_URL}/tag/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      ...articleUrls,
      ...categoryUrls,
      ...tagUrls,
    ];
  } catch (error) {
    console.error("Database connection failed during build in sitemap", error);
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      }
    ];
  }
}
