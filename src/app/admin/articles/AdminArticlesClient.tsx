"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { deleteArticleAction } from "./actions";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  publishStatus: string;
  authorName: string;
  categoryName: string;
}

interface Props {
  initialArticles: Article[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentStatus: string;
}

export default function AdminArticlesClient({
  initialArticles,
  total,
  totalPages,
  currentPage,
  currentSearch,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const updateFilters = (newSearch: string, newStatus: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newStatus !== "all") params.set("status", newStatus);
    if (newPage > 1) params.set("page", newPage.toString());
    router.push(`/admin/articles?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    updateFilters(e.target.value, currentStatus, 1);
  };

  const handleStatusChange = (status: string) => {
    updateFilters(search, status, 1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      setIsDeleting(id);
      await deleteArticleAction(id);
      setIsDeleting(null);
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                currentStatus === s
                  ? "bg-foreground text-background font-medium"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Author</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialArticles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No articles found.
                </td>
              </tr>
            ) : (
              initialArticles.map((article) => (
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
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                      {article.excerpt}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {article.authorName}
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
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {article.categoryName}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        disabled={isDeleting === article.id}
                        className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {total} article{total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateFilters(search, currentStatus, currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => updateFilters(search, currentStatus, currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
