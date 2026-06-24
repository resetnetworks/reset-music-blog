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

function htmlToMarkdown(htmlString: string): string {
  if (typeof window === "undefined") return htmlString;

  // Create a temporary hidden container to let the browser evaluate class rules & CSS inheritance
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.width = "0";
  container.style.height = "0";
  container.style.overflow = "hidden";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "-9999";
  container.innerHTML = htmlString;
  document.body.appendChild(container);

  function convertNode(node: Node, context = { bold: false, italic: false, inHeading: false }): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    if (tagName === "style" || tagName === "script") {
      return "";
    }

    // Evaluate computed style values directly using the browser's CSS rendering engine
    const computedStyle = window.getComputedStyle(element);
    const fontWeight = computedStyle.fontWeight;
    const fontStyle = computedStyle.fontStyle;
    const fontSize = computedStyle.fontSize;

    const isBold = fontWeight === "bold" || parseInt(fontWeight) >= 700 || tagName === "strong" || tagName === "b";
    const isItalic = fontStyle === "italic" || fontStyle === "oblique" || tagName === "em" || tagName === "i";

    // Detect heading level based on computed font size (Google Docs heading mimicry)
    let isHeading = false;
    let headingLevel = 3;
    if (fontSize) {
      const sizePx = parseFloat(fontSize);
      if (sizePx >= 26) {
        isHeading = true;
        headingLevel = 1;
      } else if (sizePx >= 21) {
        isHeading = true;
        headingLevel = 2;
      } else if (sizePx >= 18) {
        isHeading = true;
        headingLevel = 3;
      }
    }

    // Override with native tags if present
    if (/^h[1-6]$/.test(tagName)) {
      isHeading = true;
      headingLevel = parseInt(tagName[1]);
    }

    const nextContext = {
      bold: context.bold || isBold,
      italic: context.italic || isItalic,
      inHeading: context.inHeading || isHeading
    };

    // Recurse child nodes
    let childrenContent = "";
    element.childNodes.forEach((child) => {
      childrenContent += convertNode(child, nextContext);
    });

    // Wrap formatting rules contextually at the outermost level
    const shouldWrapBold = isBold && !context.bold;
    const shouldWrapItalic = isItalic && !context.italic;
    const shouldWrapHeading = isHeading && !context.inHeading;

    let formattedText = childrenContent;

    if (shouldWrapBold && shouldWrapItalic) {
      const clean = formattedText.trim();
      formattedText = clean ? `***${clean}***` : formattedText;
    } else if (shouldWrapBold) {
      const clean = formattedText.trim();
      formattedText = clean ? `**${clean}**` : formattedText;
    } else if (shouldWrapItalic) {
      const clean = formattedText.trim();
      formattedText = clean ? `*${clean}*` : formattedText;
    }

    if (shouldWrapHeading) {
      const hashes = "#".repeat(headingLevel);
      return `\n\n${hashes} ${formattedText.trim()}\n\n`;
    }

    switch (tagName) {
      case "a": {
        const href = element.getAttribute("href") || "";
        const cleanAnchor = formattedText.trim();
        return cleanAnchor && href ? `[${cleanAnchor}](${href})` : formattedText;
      }

      case "p":
      case "div": {
        let text = formattedText.trim();
        // Regex to convert Google Docs lists bullet markers to standard markdown list items
        const bulletRegex = /^[●○■▪\u2022\u25e6\u25aa\u25ab]\s*(.+)$/;
        const match = bulletRegex.exec(text);
        if (match) {
          return `\n\n* ${match[1]}\n\n`;
        }
        return `\n\n${text}\n\n`;
      }

      case "ul":
      case "ol":
        return `\n\n${formattedText}\n\n`;
      case "li": {
        const isOrdered = element.parentElement?.tagName.toLowerCase() === "ol";
        if (isOrdered) {
          const siblings = Array.from(element.parentElement?.children || []);
          const index = siblings.indexOf(element) + 1;
          return `${index}. ${formattedText.trim()}\n`;
        }
        return `* ${formattedText.trim()}\n`;
      }
      case "br":
        return "\n";
      case "code":
        return `\`${formattedText}\``;
      case "pre":
        return `\n\`\`\`\n${formattedText}\n\`\`\`\n`;
      default:
        return formattedText;
    }
  }

  let markdown = convertNode(container);

  // Clean up
  document.body.removeChild(container);

  // Clean up duplicate newlines
  markdown = markdown
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return markdown;
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isContentUploading, setIsContentUploading] = useState(false);

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

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsContentUploading(true);
      const { uploadUrl, fileUrl } = await getPresignedUrlAction(file.type);

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
        const textarea = document.getElementById("markdown-editor-textarea") as HTMLTextAreaElement;
        const markdownImage = `\n![${file.name}](${fileUrl})\n`;

        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          const newContent = text.substring(0, start) + markdownImage + text.substring(end);
          setContent(newContent);

          setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + markdownImage.length;
          }, 50);
        } else {
          setContent((prev: string) => prev + markdownImage);
        }
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setIsContentUploading(false);
    }
  };

  const handleTextareaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    e.preventDefault();

    try {
      setIsContentUploading(true);
      const { uploadUrl, fileUrl } = await getPresignedUrlAction(file.type);

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
        const textarea = e.currentTarget;
        const markdownImage = `\n![${file.name}](${fileUrl})\n`;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newContent = text.substring(0, start) + markdownImage + text.substring(end);
        setContent(newContent);

        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + markdownImage.length;
        }, 50);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setIsContentUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData("text/html");
    if (!html) return;

    e.preventDefault();

    const markdown = htmlToMarkdown(html);

    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newContent = text.substring(0, start) + markdown + text.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {[key: string]: string} = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (!authorId) newErrors.authorId = "Author is required";
    if (!categoryId) newErrors.categoryId = "Category is required";
    if (!content.trim()) newErrors.content = "Content is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(`field-${firstErrorField}`) || (firstErrorField === "content" ? document.getElementById("markdown-editor-textarea") : null);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        (element as HTMLElement).focus();
      }
      return;
    }

    setErrors({});
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
              className="w-full h-auto max-h-[650px] object-contain rounded-lg mb-8 bg-secondary/20"
            />
          )}
          <MarkdownRenderer content={content} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex justify-between">
                <span>Title <span className="text-red-500" style={{ color: "#ef4444" }}>*</span></span>
              </label>
              <input
                type="text"
                id="field-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                }}
                className={`w-full px-3 py-2 text-sm bg-background border rounded-md outline-none focus:ring-1 ${
                  errors.title ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-foreground/20"
                }`}
                style={errors.title ? { borderColor: "#ef4444" } : {}}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1" style={{ color: "#ef4444" }}>{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 flex justify-between">
                <span>Slug <span className="text-red-500" style={{ color: "#ef4444" }}>*</span></span>
              </label>
              <input
                type="text"
                id="field-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                  if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
                }}
                className={`w-full px-3 py-2 text-sm bg-background border rounded-md outline-none focus:ring-1 font-mono ${
                  errors.slug ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-foreground/20"
                }`}
                style={errors.slug ? { borderColor: "#ef4444" } : {}}
              />
              {errors.slug && <p className="text-xs text-red-500 mt-1" style={{ color: "#ef4444" }}>{errors.slug}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 flex justify-between">
                  <span>Author <span className="text-red-500" style={{ color: "#ef4444" }}>*</span></span>
                </label>
                <select
                  id="field-authorId"
                  value={authorId}
                  onChange={(e) => {
                    setAuthorId(e.target.value);
                    if (errors.authorId) setErrors((prev) => ({ ...prev, authorId: "" }));
                  }}
                  className={`w-full px-3 py-2 text-sm bg-background border rounded-md outline-none focus:ring-1 ${
                    errors.authorId ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-foreground/20"
                  }`}
                  style={errors.authorId ? { borderColor: "#ef4444" } : {}}
                >
                  <option value="">Select author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
                {errors.authorId && <p className="text-xs text-red-500 mt-1" style={{ color: "#ef4444" }}>{errors.authorId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex justify-between">
                  <span>Category <span className="text-red-500" style={{ color: "#ef4444" }}>*</span></span>
                </label>
                <select
                  id="field-categoryId"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
                  }}
                  className={`w-full px-3 py-2 text-sm bg-background border rounded-md outline-none focus:ring-1 ${
                    errors.categoryId ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-foreground/20"
                  }`}
                  style={errors.categoryId ? { borderColor: "#ef4444" } : {}}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-red-500 mt-1" style={{ color: "#ef4444" }}>{errors.categoryId}</p>}
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium flex justify-between">
                  <span>Content (Markdown) <span className="text-red-500" style={{ color: "#ef4444" }}>*</span></span>
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-xs font-medium rounded border border-border transition-colors select-none">
                  <Upload className="w-3.5 h-3.5" />
                  {isContentUploading ? "Uploading..." : "Upload & Insert Image"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleContentImageUpload}
                    disabled={isContentUploading}
                  />
                </label>
              </div>
              <textarea
                id="markdown-editor-textarea"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
                }}
                onDrop={handleTextareaDrop}
                onDragOver={(e) => e.preventDefault()}
                onPaste={handlePaste}
                required
                rows={20}
                placeholder="Write your article in markdown here... You can also drop image files directly here to upload and insert them."
                className={`w-full px-3 py-2 text-sm bg-background border rounded-md outline-none focus:ring-1 font-mono leading-relaxed resize-y ${
                  errors.content ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-foreground/20"
                }`}
                style={errors.content ? { borderColor: "#ef4444" } : {}}
              />
              {errors.content && <p className="text-xs text-red-500 mt-1" style={{ color: "#ef4444" }}>{errors.content}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${selectedTagIds.includes(tag.id)
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
