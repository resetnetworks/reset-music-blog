import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Tag from "@/models/Tag";

// Ensure Author and Category models are registered
import "@/models/Author";
import "@/models/Category";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const tag = await Tag.findOne({ slug }).lean();
  
  if (!tag) return { title: "Tag Not Found" };
  
  return {
    title: `${tag.name} | Reset Music`,
    description: `Browse articles tagged with ${tag.name}`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  
  const { slug } = await params;
  const tag = await Tag.findOne({ slug }).lean();

  if (!tag) {
    notFound();
  }

  const articles = await Article.find({
    tags: tag._id,
    publishStatus: "published",
  })
    .sort({ publishedAt: -1 })
    .limit(12)
    .populate("author", "name slug")
    .populate("category", "name slug")
    .lean();

  const mappedArticles = articles.map((a: any) => ({
    id: a._id.toString(),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    readingTime: a.readingTime || 5,
    publishedAt: a.publishedAt || a.createdAt || null,
    authorName: a.author?.name || "Unknown",
    authorSlug: a.author?.slug || "",
    categoryName: a.category?.name || "Uncategorized",
    categorySlug: a.category?.slug || "",
  }));

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All articles
      </Link>

      {/* Tag Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl text-muted-foreground">#</span>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {tag.name}
          </h1>
        </div>
        <p className="text-muted-foreground">Articles tagged with {tag.name}</p>
      </div>

      {/* Articles */}
      {mappedArticles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No articles with this tag yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mappedArticles.map((article: any) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
