import Link from "next/link";
import { FileText, Eye, TrendingUp, Plus } from "lucide-react";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import "@/models/Category"; // Register model
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Reset Music",
};

export default async function AdminDashboard() {
  await dbConnect();

  const [articles, totalArticles, totalCategories, totalTags] = await Promise.all([
    Article.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("category", "name")
      .lean(),
    Article.countDocuments(),
    Category.countDocuments(),
    Tag.countDocuments(),
  ]);

  const publishedCount = await Article.countDocuments({ publishStatus: "published" });

  const mappedArticles = articles.map((a: any) => ({
    id: a._id.toString(),
    title: a.title,
    publishStatus: a.publishStatus,
    categoryName: a.category?.name || "Uncategorized",
    updatedAt: a.updatedAt,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your content
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">
              Total
            </span>
          </div>
          <p className="text-2xl font-semibold">{totalArticles}</p>
          <p className="text-xs text-muted-foreground mt-1">articles</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Eye className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">
              Published
            </span>
          </div>
          <p className="text-2xl font-semibold">{publishedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">live articles</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">
              Categories
            </span>
          </div>
          <p className="text-2xl font-semibold">{totalCategories}</p>
          <p className="text-xs text-muted-foreground mt-1">categories</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">
              Tags
            </span>
          </div>
          <p className="text-2xl font-semibold">{totalTags}</p>
          <p className="text-xs text-muted-foreground mt-1">tags</p>
        </div>
      </div>

      {/* Recent Articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent Articles
          </h2>
          <Link
            href="/admin/articles"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {mappedArticles.map((article: any) => (
                <tr
                  key={article.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="font-medium hover:opacity-70 transition-opacity"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        article.publishStatus === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {article.publishStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {article.categoryName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {article.updatedAt
                      ? new Date(article.updatedAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
