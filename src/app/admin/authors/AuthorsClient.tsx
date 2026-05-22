"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createAuthorAction, deleteAuthorAction } from "./actions";

export default function AuthorsClient({ initialAuthors }: { initialAuthors: any[] }) {
  const [authors, setAuthors] = useState(initialAuthors);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("bio", bio);
    formData.append("avatar", avatar);

    const res = await createAuthorAction(formData);
    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
    } else {
      setName("");
      setSlug("");
      setBio("");
      setAvatar("");
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this author?")) return;
    const res = await deleteAuthorAction(id);
    if (!res.error) {
      setAuthors(authors.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Manage Authors</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="p-4 border border-border rounded-lg bg-background space-y-4">
            <h2 className="text-sm font-medium mb-4">Add New Author</h2>
            
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
              <label className="block text-xs text-muted-foreground mb-1.5">Avatar URL (Optional)</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Bio (Optional)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
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
              Add Author
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="border border-border rounded-lg bg-background overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Author</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {authors.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                      No authors found.
                    </td>
                  </tr>
                ) : (
                  authors.map((a) => (
                    <tr key={a.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {a.avatar ? (
                            <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
                              {a.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{a.name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">{a.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(a.id)}
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
