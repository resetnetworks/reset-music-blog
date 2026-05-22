"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, ArrowLeft, Upload } from "lucide-react";
import { saveArticleAction, getPresignedUrlAction } from "./editorActions";
import MarkdownRenderer from "@/components/article/MarkdownRenderer";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 200);
}

export default function EditorClient({
  initialData,
  authors,
  categories,
  tags,
}: {
  initialData: any;
  authors: any[];
  categories: any[];
  tags: any[];
}) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [authorId, setAuthorId] = useState(initialData?.authorId || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">(
    initialData?.publishStatus || "draft"
  );
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tagIds || []
  );

  const [showPreview, setShowPreview] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!slugManuallyEdited && title && !isEditing) {
      setSlug(slugify(title));
    }
  }, [title, isEditing, slugManuallyEdited]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { uploadUrl, fileUrl } = await getPresignedUrlAction(
        file.type
      );

      console.log("Generated Upload URL:", uploadUrl);
      console.log("Generated File URL:", fileUrl);

      if (!uploadUrl) {
        throw new Error("Failed to get presigned URL");
      }

      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (res.ok) {
        setCoverImage(fileUrl);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    if (isEditing) formData.append("id", initialData.id);
    formData.append("title", title);
    formData.append("slug", slug);
    if (excerpt) formData.append("excerpt", excerpt);
    formData.append("content", content);
    if (coverImage) formData.append("coverImage", coverImage);
    formData.append("authorId", authorId);
    formData.append("categoryId", categoryId);
    if (seoTitle) formData.append("seoTitle", seoTitle);
    if (seoDescription) formData.append("seoDescription", seoDescription);
    formData.append("publishStatus", publishStatus);
    formData.append("featured", featured.toString());
    formData.append("tagIds", JSON.stringify(selectedTagIds));

    const result = await saveArticleAction(formData);
    
    setIsSubmitting(false);

    if (result.error) {
      alert(result.error);
    } else {
      router.push("/admin/articles");
      router.refresh();
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/articles")}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold tracking-tight">
            {isEditing ? "Edit Article" : "New Article"}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border text-sm font-medium rounded-md hover:bg-secondary transition-colors"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div className="border border-border rounded-lg p-8 bg-background">
          <h1 className="text-3xl font-semibold tracking-tight mb-4">{title}</h1>
          {excerpt && (
            <p className="text-lg text-muted-foreground mb-6">{excerpt}</p>
          )}
          {coverImage && (
            <img
              src={coverImage}
              alt={title}
              className="w-full aspect-[16/9] object-cover rounded-lg mb-8"
            />
          )}
          <MarkdownRenderer content={content} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                }}
                required
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Author</label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20"
                >
                  <option value="">Select author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Cover Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20"
                  placeholder="https://example.com/image.jpg"
                />
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload S3"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Preview"
                  className="mt-2 w-40 h-24 object-cover rounded-md"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Content (Markdown)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={20}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-foreground/20 font-mono leading-relaxed resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-foreground text-background font-medium"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold">SEO Settings</h3>
              <div>
                <label className="block text-sm font-medium mb-1.5">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">SEO Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md outline-none resize-none"
                />
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold">Publishing</h3>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select
                    value={publishStatus}
                    onChange={(e) => setPublishStatus(e.target.value as "draft" | "published")}
                    className="px-3 py-2 text-sm bg-background border border-border rounded-md outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm">
                    Featured article
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : isEditing ? "Update Article" : "Save Article"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/articles")}
              className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
