"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

function FiltersContent({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const categorySlug = searchParams.get("category") || "";

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    // Avoid pushing to the router if the query hasn't changed
    if (searchQuery === currentSearch) return;

    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        newParams.set("search", searchQuery);
      } else {
        newParams.delete("search");
      }
      newParams.delete("page"); // Reset page on search
      router.push(`/blog?${newParams.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, router, searchParams]);

  const handleCategoryFilter = (slug: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (slug === categorySlug) {
      newParams.delete("category");
    } else {
      newParams.set("category", slug);
    }
    newParams.delete("page");
    router.push(`/blog?${newParams.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("category");
            router.push(`/blog?${newParams.toString()}`);
          }}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            !categorySlug
              ? "bg-foreground text-background font-medium"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
          }`}
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryFilter(cat.slug)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              categorySlug === cat.slug
                ? "bg-foreground text-background font-medium"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </>
  );
}

export default function BlogFilters({ categories }: { categories: Category[] }) {
  return (
    <Suspense fallback={<div className="h-24" />}>
      <FiltersContent categories={categories} />
    </Suspense>
  );
}
