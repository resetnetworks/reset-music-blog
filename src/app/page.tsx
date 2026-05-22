import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Category from "@/models/Category";
import Author from "@/models/Author";

// Ensure Author and Category models are registered for populate
import "@/models/Author";
import "@/models/Category";

export const revalidate = 60; // ISR every 60 seconds

async function getHomeData() {
  await dbConnect();
  
  const [featuredArticles, latestArticles, trendingArticles, categories] = await Promise.all([
    Article.find({ publishStatus: "published", featured: true })
      .sort({ publishedAt: -1 })
      .limit(3)
      .populate("author", "name slug")
      .populate("category", "name slug")
      .lean(),
    Article.find({ publishStatus: "published" })
      .sort({ publishedAt: -1 })
      .limit(6)
      .populate("author", "name slug")
      .populate("category", "name slug")
      .lean(),
    Article.find({ publishStatus: "published" })
      .sort({ viewCount: -1, publishedAt: -1 })
      .limit(4)
      .populate("author", "name slug")
      .lean(),
    Category.find().lean()
  ]);

  // Aggregate article counts per category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat: any) => {
      const count = await Article.countDocuments({ category: cat._id, publishStatus: "published" });
      return { ...cat, articleCount: count };
    })
  );

  return {
    featuredArticles: JSON.parse(JSON.stringify(featuredArticles)),
    latestArticles: JSON.parse(JSON.stringify(latestArticles)),
    trendingArticles: JSON.parse(JSON.stringify(trendingArticles)),
    categories: JSON.parse(JSON.stringify(categoriesWithCounts)),
  };
}

// Adapt Mongoose article to ArticleCard format
function mapArticle(a: any) {
  return {
    id: a._id.toString(),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    readingTime: a.readingTime || 5,
    publishedAt: a.publishedAt,
    authorName: a.author?.name || "Unknown",
    authorSlug: a.author?.slug || "",
    categoryName: a.category?.name || "Uncategorized",
    categorySlug: a.category?.slug || "",
  };
}

export default async function Home() {
  const { featuredArticles, latestArticles, trendingArticles, categories } = await getHomeData();

  const mappedFeatured = featuredArticles.map(mapArticle);
  const mappedLatest = latestArticles.map(mapArticle);
  const mappedTrending = trendingArticles.map(mapArticle);

  const featuredSlugs = new Set(mappedFeatured.map((a: any) => a.slug));
  const nonFeaturedLatest = mappedLatest.filter((a: any) => !featuredSlugs.has(a.slug));

  return (
    <>
      {/* Hero Section */}
      <section className="pt-10 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.15] mb-4">
              Music production, culture, and the art of sound
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Deep insights for producers, artists, and music makers. No fluff, no noise — just
              practical knowledge from people who live and breathe music.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {mappedFeatured.length > 0 && (
        <section className="pb-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Featured
              </h2>
              <Link
                href="/blog"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Primary Featured */}
            {mappedFeatured[0] && (
              <div className="mb-10">
                <ArticleCard article={mappedFeatured[0]} variant="featured" />
              </div>
            )}

            {/* Secondary Featured */}
            {mappedFeatured.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/40">
                {mappedFeatured.slice(1).map((article: any) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="pb-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
              Browse by Category
            </h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className="px-4 py-2 bg-secondary/60 hover:bg-secondary rounded-md text-sm font-medium transition-colors"
                >
                  {cat.name}
                  {cat.articleCount > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {cat.articleCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest + Trending Grid */}
      <section className="pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            {/* Latest Articles */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Latest Articles
                </h2>
                <Link
                  href="/blog"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-0">
                {nonFeaturedLatest.slice(0, 5).map((article: any) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </div>

            {/* Trending Sidebar */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Trending
                </h2>
              </div>
              <div className="space-y-0">
                {mappedTrending.map((article: any, index: number) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group flex gap-4 py-4 border-b border-border/40 last:border-0"
                  >
                    <span className="text-2xl font-semibold text-muted-foreground/30 shrink-0 w-8">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
                        {article.title}
                      </h3>
                      <span className="text-xs text-muted-foreground mt-1.5 inline-block">
                        {article.authorName}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-border/60 rounded-lg p-8 md:p-12 text-center max-w-xl mx-auto">
            <h2 className="text-xl font-semibold tracking-tight mb-2">
              Stay in the loop
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Get new articles delivered to your inbox. No spam, just quality music production content.
            </p>
            <div className="flex gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20"
              />
              <button className="px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
