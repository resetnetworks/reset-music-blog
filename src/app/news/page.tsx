import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Category from "@/models/Category";

// Ensure models are registered for populate
import "@/models/Author";
import "@/models/Category";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Industry News | Reset Music",
  description: "Stay up to date with the latest music production news, software releases, gear updates, and industry insights.",
};

export default async function NewsPage() {
  await dbConnect();

  // Try to find the 'news' category (case-insensitive)
  const newsCategory = await Category.findOne({
    $or: [
      { slug: "news" },
      { name: { $regex: /^news$/i } }
    ]
  }).lean();

  let articles: any[] = [];

  if (newsCategory) {
    articles = await Article.find({
      category: newsCategory._id,
      publishStatus: "published",
    })
      .sort({ publishedAt: -1 })
      .limit(12)
      .populate("author", "name slug")
      .populate("category", "name slug")
      .lean();
  }

  // If no news articles, fetch some latest general articles to display as "Recommended Reading"
  const showFallback = articles.length === 0;
  if (showFallback) {
    articles = await Article.find({ publishStatus: "published" })
      .sort({ publishedAt: -1 })
      .limit(3)
      .populate("author", "name slug")
      .populate("category", "name slug")
      .lean();
  }

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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back to Home */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Reset Newsroom
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 leading-tight">
          Latest Music Industry Updates &amp; Gear Releases
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          Stay on top of hardware announcements, software updates, VST releases, and trends shaping the future of music production.
        </p>
      </div>

      {/* Content */}
      {showFallback ? (
        <div className="space-y-16">
          {/* Empty News State */}
          <div className="p-8 md:p-12 bg-secondary/30 rounded-xl border border-border/40 text-center max-w-2xl">
            <h3 className="text-lg font-semibold mb-2">No news stories published yet</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are currently setting up our newsroom. Check back soon for press releases, software launch details, and industry announcements.
            </p>
          </div>

          {/* Fallback general articles */}
          {mappedArticles.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">
                Recommended from our Blog
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mappedArticles.map((article: any) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Actual News Articles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mappedArticles.map((article: any) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
