"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createCategoryAction, deleteCategoryAction } from "./actions";

export default function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);

    const res = await createCategoryAction(formData);
    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await deleteCategoryAction(id);
    if (!res.error) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Manage Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="p-4 border border-border rounded-lg bg-background space-y-4">
            <h2 className="text-sm font-medium mb-4">Add New Category</h2>
            
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                }}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="border border-border rounded-lg bg-background overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{cat.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
