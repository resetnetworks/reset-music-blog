import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Author from "@/models/Author";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import EditorClient from "../../EditorClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Article | Reset Music",
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const { id } = await params;
  const [article, authors, categories, tags] = await Promise.all([
    Article.findById(id).lean(),
    Author.find().lean(),
    Category.find().lean(),
    Tag.find().lean(),
  ]);

  if (!article) {
    notFound();
  }

  const mapToId = (arr: any[]) => arr.map(a => ({ id: a._id.toString(), name: a.name }));

  const initialData = {
    id: article._id.toString(),
    title: article.title || "",
    slug: article.slug || "",
    excerpt: article.excerpt || "",
    content: article.content || "",
    coverImage: article.coverImage || "",
    authorId: article.author?.toString() || "",
    categoryId: article.category?.toString() || "",
    tagIds: article.tags?.map((t: any) => t.toString()) || [],
    seoTitle: article.seoTitle || "",
    seoDescription: article.seoDescription || "",
    publishStatus: article.publishStatus || "draft",
    featured: article.featured || false,
  };

  return (
    <EditorClient
      initialData={initialData}
      authors={mapToId(authors)}
      categories={mapToId(categories)}
      tags={mapToId(tags)}
    />
  );
}
