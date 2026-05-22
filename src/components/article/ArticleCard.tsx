import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ArticleCardProps {
  article: {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    readingTime: number;
    publishedAt: Date | null;
    authorName: string;
    authorSlug: string;
    categoryName: string;
    categorySlug: string;
  };
  variant?: "default" | "featured" | "compact";
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const formattedDate = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : "";

  if (variant === "featured") {
    return (
      <Link
        href={`/blog/${article.slug}`}
        className="group block"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="aspect-[16/10] overflow-hidden rounded-lg bg-muted">
            {article.coverImage ? (
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {article.categoryName}
              </span>
              <span className="text-xs text-muted-foreground/50">&middot;</span>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 leading-tight group-hover:opacity-70 transition-opacity">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-base text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>by {article.authorName}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readingTime} min read
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/blog/${article.slug}`}
        className="group flex gap-4 py-4 border-b border-border/40 last:border-0"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {article.categoryName}
            </span>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
          <h3 className="text-base font-medium leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
            {article.title}
          </h3>
          <span className="text-xs text-muted-foreground mt-1.5 inline-block">
            {article.authorName} &middot; {article.readingTime} min read
          </span>
        </div>
        {article.coverImage && (
          <div className="w-20 h-20 shrink-0 overflow-hidden rounded-md bg-muted">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block"
    >
      <div className="aspect-[16/10] overflow-hidden rounded-lg bg-muted mb-4">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {article.categoryName}
        </span>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight mb-2 leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {article.excerpt}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>by {article.authorName}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readingTime} min
        </span>
      </div>
    </Link>
  );
}
