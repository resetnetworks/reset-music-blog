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

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata = {
  title: "Reset Music — Music Production Tips, Tutorials & Culture",
  description:
    "Reset Music is your go-to resource for music production tutorials, beat-making guides, industry insights, and creative inspiration. Written by producers, for producers.",
  keywords: [
    "music production",
    "beat making",
    "music tutorials",
    "producer tips",
    "recording techniques",
    "music theory",
    "DAW tutorials",
    "mixing and mastering",
    "music culture",
    "sound design",
  ],
  openGraph: {
    title: "Reset Music — Music Production Tips, Tutorials & Culture",
    description:
      "Deep dives into music production, sound design, and the art of making music. No filler — just real knowledge from working producers.",
    url: "https://blog.musicreset.com",
    siteName: "Reset Music",
    type: "website",
    images: [
      {
        url: "https://musicreset.com/og-image-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Reset Music — Music Production Tips, Tutorials & Culture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reset Music — Music Production Tips, Tutorials & Culture",
    description:
      "Deep dives into music production, sound design, and the art of making music. No filler — just real knowledge from working producers.",
    images: ["https://musicreset.com/og-image-1200x630.jpg"],
  },
};

// ─── Data Fetching ────────────────────────────────────────────────────────────
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
    Category.find().lean(),
  ]);

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat: any) => {
      const count = await Article.countDocuments({
        category: cat._id,
        publishStatus: "published",
      });
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

// ─── Article Mapper ───────────────────────────────────────────────────────────
function mapArticle(a: any) {
  return {
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
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Home() {
  const { featuredArticles, latestArticles, trendingArticles, categories } = await getHomeData();

  const mappedFeatured = featuredArticles.map(mapArticle);
  const mappedLatest = latestArticles.map(mapArticle);
  const mappedTrending = trendingArticles.map(mapArticle);

  const nonFeaturedLatest = mappedLatest;

  return (
    <>
      {/*
       * ── Hero Section ────────────────────────────────────────────────────────
       * H1 contains the primary keyword phrase for the homepage.
       * The sub-copy reinforces topical authority and speaks directly to the
       * target audience (producers / music makers).
       */}
      <section className="pt-10 pb-16" aria-label="Site introduction">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <h1 className="text-xl md:text-2xl lg:text-2xl font-normal leading-[1.15] mb-4">
              The official Reset Music Blog exploring ambient, experimental, and instrumental music through artist stories, audio technology, industry insights, and creative culture.
            </h1>
          </div>
        </div>
      </section>

      {/*
       * ── Featured Articles ────────────────────────────────────────────────────
       * Section heading uses an <h2> so the heading hierarchy is preserved
       * (H1 → H2 → H3 inside cards). The "View all" link passes link equity to
       * the /blog index.
       */}
      {mappedFeatured.length > 0 && (
        <section className="pb-16" aria-label="Featured articles">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Editor's Picks
              </h2>
              <Link
                href="/blog"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                aria-label="View all articles on the blog"
              >
                View all articles <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>

            {/* Primary Featured */}
            {mappedFeatured[0] && (
              <div className="mb-10">
                <ArticleCard article={mappedFeatured[0]} variant="featured" />
              </div>
            )}
          </div>
        </section>
      )}

      {/*
       * ── Categories ──────────────────────────────────────────────────────────
       * Internal links to category pages help distribute link equity and let
       * search engines discover topic clusters (e.g. "Mixing", "Sound Design").
       * The article count signals content depth to users.
       */}
      {categories.length > 0 && (
        <section className="pb-16" aria-label="Browse by topic">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
              Explore Topics
            </h2>
            <div className="flex flex-wrap gap-3" role="list">
              {categories.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  role="listitem"
                  className="px-4 py-2 bg-secondary/60 hover:bg-secondary rounded-md text-sm font-medium transition-colors"
                  aria-label={`Browse ${cat.name} articles (${cat.articleCount})`}
                >
                  {cat.name}
                  {cat.articleCount > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground" aria-hidden="true">
                      {cat.articleCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/*
       * ── Latest + Trending Grid ───────────────────────────────────────────────
       * Two complementary signals for readers and crawlers:
       * "Latest" = freshness / recency.
       * "Trending" = engagement / authority. Both support topical relevance.
       */}
      <section className="pb-16" aria-label="Latest and trending articles">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full">

            {/* Latest Articles */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Latest Articles
                </h2>
                <Link
                  href="/blog"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  aria-label="See all latest music production articles"
                >
                  See all <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
              <div className="space-y-0">
                {nonFeaturedLatest.slice(0, 5).map((article: any) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/*
       * ── Bottom CTA / About Blurb ─────────────────────────────────────────────
       * A short keyword-rich paragraph near the page footer reinforces topical
       * relevance without stuffing. Also gives first-time visitors context.
       */}
      <section className="pb-20" aria-label="About Reset Music">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-border/40 pt-12 max-w-2xl">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              About Reset Music
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Reset Music is an independent publication dedicated to the craft of making music. We
              publish in-depth tutorials on music production, interviews with working artists,
              breakdowns of production techniques, and honest gear reviews — all written by
              producers who still make music every day.
            </p>
            {/* <Link
              href="/about"
              className="inline-flex items-center gap-1 mt-4 text-sm font-medium hover:opacity-70 transition-opacity"
            >
              Learn more about us <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link> */}
          </div>
        </div>
      </section>
    </>
  );
}