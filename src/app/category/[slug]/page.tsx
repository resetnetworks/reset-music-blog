import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Category from "@/models/Category";

// Ensure Author and Category models are registered
import "@/models/Author";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const category = await Category.findOne({ slug }).lean();
  
  if (!category) return { title: "Category Not Found" };
  
  const title = `${category.name} | Reset Music`;
  const description = category.description || `Browse articles and tutorials in ${category.name} on Reset Music.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://blog.musicreset.com/category/${slug}`,
      siteName: "Reset Music",
      type: "website",
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `${category.name} | Reset Music`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  
  const { slug } = await params;
  const category = await Category.findOne({ slug }).lean();

  if (!category) {
    notFound();
  }

  const articles = await Article.find({
    category: category._id,
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

      {/* Category Header */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      {/* Articles */}
      {mappedArticles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No articles in this category yet.
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
