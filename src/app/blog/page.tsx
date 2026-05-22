import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import BlogFilters from "@/components/blog/BlogFilters";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Category from "@/models/Category";
import Author from "@/models/Author";

// Ensure models are registered
import "@/models/Author";
import "@/models/Category";

export const metadata = {
  title: "All Articles | Reset Music",
  description: "Browse all articles on music production, culture, and creativity.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await dbConnect();
  
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : "";
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  
  const limit = 9;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = { publishStatus: "published" };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } }
    ];
  }

  // Categories
  const categories = await Category.find().lean();
  const serializedCategories = categories.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
  }));

  if (categorySlug) {
    const cat = categories.find((c: any) => c.slug === categorySlug);
    if (cat) {
      query.category = cat._id;
    }
  }

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name slug")
      .populate("category", "name slug")
      .lean(),
    Article.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Map articles
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
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
          All Articles
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {total} article{total !== 1 ? "s" : ""} on music production, culture, and creativity
        </p>
      </div>

      <BlogFilters categories={serializedCategories} />

      {/* Articles Grid */}
      {mappedArticles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No articles found.</p>
          {(search || categorySlug) && (
            <Link
              href="/blog"
              className="text-sm font-medium text-foreground underline underline-offset-4"
            >
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mappedArticles.map((article: any) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {page > 1 ? (
            <Link
              href={`/blog?page=${page - 1}${search ? `&search=${search}` : ""}${categorySlug ? `&category=${categorySlug}` : ""}`}
              className="p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          ) : (
            <button disabled className="p-2 text-sm text-muted-foreground opacity-30 cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            return (
              <Link
                key={pageNum}
                href={`/blog?page=${pageNum}${search ? `&search=${search}` : ""}${categorySlug ? `&category=${categorySlug}` : ""}`}
                className={`flex items-center justify-center w-8 h-8 text-sm rounded-md transition-colors ${
                  page === pageNum
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}

          {page < totalPages ? (
            <Link
              href={`/blog?page=${page + 1}${search ? `&search=${search}` : ""}${categorySlug ? `&category=${categorySlug}` : ""}`}
              className="p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button disabled className="p-2 text-sm text-muted-foreground opacity-30 cursor-not-allowed">
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
