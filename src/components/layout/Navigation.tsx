"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Navigation({ categories }: { categories: Category[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[hsl(30,20%,99%)]/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <img 
                src="/icon.svg" 
                alt="Reset Music Logo" 
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-lg font-semibold tracking-tight text-foreground hidden sm:inline-block">
                Reset Music
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm transition-colors ${
                  isHome ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className={`text-sm transition-colors ${
                  pathname === "/blog"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Articles
              </Link>
              <Link
                href="/news"
                className={`text-sm transition-colors ${
                  pathname === "/news"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                News
              </Link>
              <Link
                href="/about"
                className={`text-sm transition-colors ${
                  pathname === "/about"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                About
              </Link>
              <Link
                href="/jobs"
                className={`text-sm transition-colors ${
                  pathname === "/jobs"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Jobs
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-border/60 bg-[hsl(30,20%,99%)]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ESC to close
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[hsl(30,20%,99%)] pt-14">
          <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`text-lg font-medium py-2 border-b border-border/40 ${
                isHome ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className={`text-lg font-medium py-2 border-b border-border/40 ${
                pathname === "/blog" ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              Articles
            </Link>
            <Link
              href="/news"
              onClick={() => setMenuOpen(false)}
              className={`text-lg font-medium py-2 border-b border-border/40 ${
                pathname === "/news" ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              News
            </Link>
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className={`text-lg font-medium py-2 border-b border-border/40 ${
                pathname === "/about" ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              About
            </Link>
            <Link
              href="/jobs"
              onClick={() => setMenuOpen(false)}
              className={`text-lg font-medium py-2 border-b border-border/40 ${
                pathname === "/jobs" ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              Jobs
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
