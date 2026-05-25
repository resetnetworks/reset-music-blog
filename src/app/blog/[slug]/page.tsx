import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import MarkdownRenderer from "@/components/article/MarkdownRenderer";
import TableOfContents from "@/components/article/TableOfContents";
import SocialShare from "@/components/article/SocialShare";
import ViewTracker from "@/components/article/ViewTracker";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";

// Ensure models are registered
import "@/models/Author";
import "@/models/Category";
import "@/models/Tag";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const { slug } = await params;
  const article = await Article.findOne({ slug }).lean();

  if (!article) {
    return { title: "Not Found" };
  }

  const seoTitle = article.seoTitle || article.title;
  const seoDescription = article.seoDescription || article.excerpt || "";
  const seoImage = article.socialImage || article.coverImage || "/og-default.png";

  return {
    title: `${seoTitle} | Reset Music`,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `https://blog.musicreset.com/blog/${slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      images: seoImage ? [seoImage] : ["/og-default.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: seoImage ? [seoImage] : ["/og-default.png"],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  
  const { slug } = await params;
  const article = await Article.findOne({ slug })
    .populate("author", "name slug avatar bio")
    .populate("category", "name slug")
    .populate("tags", "name slug")
    .lean();

  if (!article || article.publishStatus !== "published") {
    notFound();
  }

  const relatedArticles = await Article.find({
    category: article.category?._id,
    _id: { $ne: article._id },
    publishStatus: "published",
  })
    .limit(3)
    .populate("category", "name slug")
    .lean();

  const dateToFormat = article.publishedAt || article.createdAt;
  const formattedDate = dateToFormat
    ? format(new Date(dateToFormat), "MMMM d, yyyy")
    : "";

  return (
    <>
      <ViewTracker id={article._id.toString()} />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-16">
          {/* Main Content */}
          <article className="min-w-0">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All articles
            </Link>

            {/* Article Header */}
            <header className="mb-8">
              {/* Category */}
              {article.category && (
                <Link
                  href={`/category/${article.category.slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-3 inline-block"
                >
                  {article.category.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-[2.5rem] font-semibold tracking-tight leading-[1.15] mb-5">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed mb-5">
                  {article.excerpt}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {article.author?.name || "Unknown"}
                </span>
                <span className="text-border">&middot;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span className="text-border">&middot;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTime || 5} min read
                </span>
              </div>
            </header>

            {/* Cover Image */}
            {article.coverImage && (
              <figure className="mb-10">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full aspect-[16/9] object-cover rounded-lg"
                />
              </figure>
            )}

            {/* Article Body */}
            <div className="prose-content">
              <MarkdownRenderer content={article.content} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-border/40">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: any) => (
                    <Link
                      key={tag._id.toString()}
                      href={`/tag/${tag.slug}`}
                      className="px-3 py-1.5 bg-secondary/60 hover:bg-secondary rounded-md text-sm transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            <div className="mt-6 pt-6 border-t border-border/40">
              <SocialShare title={article.title} />
            </div>

            {/* Author Bio */}
            <div className="mt-10 p-6 bg-secondary/30 rounded-lg">
              <div className="flex items-start gap-4">
                {article.author?.avatar ? (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-lg font-medium">
                      {article.author?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                )}
                <div>
                  <Link
                    href={`/author/${article.author?.slug || ""}`}
                    className="font-medium hover:opacity-70 transition-opacity"
                  >
                    {article.author?.name || "Unknown"}
                  </Link>
                  {article.author?.bio && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {article.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-semibold tracking-tight mb-5">
                  Related Articles
                </h3>
                <div className="space-y-0">
                  {relatedArticles.map((rel: any) => (
                    <Link
                      key={rel._id.toString()}
                      href={`/blog/${rel.slug}`}
                      className="group flex gap-4 py-4 border-b border-border/40 last:border-0"
                    >
                      {rel.coverImage && (
                        <div className="w-20 h-20 shrink-0 overflow-hidden rounded-md bg-muted">
                          <img
                            src={rel.coverImage}
                            alt={rel.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {rel.category?.name}
                        </span>
                        <h4 className="text-sm font-medium leading-snug group-hover:opacity-70 transition-opacity line-clamp-2 mt-1">
                          {rel.title}
                        </h4>
                        <span className="text-xs text-muted-foreground mt-1.5 inline-block">
                          {rel.readingTime || 5} min read
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <TableOfContents content={article.content} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
