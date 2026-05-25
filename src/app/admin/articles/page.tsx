import Link from "next/link";
import { Plus } from "lucide-react";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import AdminArticlesClient from "./AdminArticlesClient";

export const dynamic = "force-dynamic";

// Register models
import "@/models/Author";
import "@/models/Category";

export const metadata = {
  title: "Manage Articles | Reset Music",
};

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await dbConnect();

  const resolvedParams = await searchParams;

  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : "";
  const status = typeof resolvedParams.status === "string" ? resolvedParams.status : "all";
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }
  if (status !== "all") {
    query.publishStatus = status;
  }

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name")
      .populate("category", "name")
      .lean(),
    Article.countDocuments(query),
  ]);

  const mappedArticles = articles.map((a: any) => ({
    id: a._id.toString(),
    title: a.title,
    excerpt: a.excerpt,
    publishStatus: a.publishStatus,
    authorName: a.author?.name || "Unknown",
    categoryName: a.category?.name || "Uncategorized",
  }));

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your published and draft articles
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      <AdminArticlesClient
        initialArticles={mappedArticles}
        total={total}
        totalPages={totalPages}
        currentPage={page}
        currentSearch={search}
        currentStatus={status}
      />
    </div>
  );
}
