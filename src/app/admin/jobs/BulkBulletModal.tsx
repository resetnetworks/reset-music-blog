"use client";

import { useState } from "react";
import { X, ListPlus, Check } from "lucide-react";
import { parseBulletList } from "@/lib/jdParser";

interface BulkBulletModalProps {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  onClose: () => void;
  onAdd: (bullets: string[], replace: boolean) => void;
}

export default function BulkBulletModal({
  isOpen,
  title,
  placeholder,
  onClose,
  onAdd,
}: BulkBulletModalProps) {
  const [text, setText] = useState("");
  const [replace, setReplace] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    const parsed = parseBulletList(text);
    if (parsed.length > 0) {
      onAdd(parsed, replace);
      setText("");
      onClose();
    }
  };

  const parsedPreview = parseBulletList(text);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-lg rounded-2xl border border-border shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <ListPlus className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm text-foreground">Bulk Paste {title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Paste multiple bullet points directly from your document. Symbols (•, -, *, 1.) will be cleanly formatted into separate items.
        </p>

        <textarea
          rows={6}
          placeholder={
            placeholder ||
            `• Edit high-energy music videos and artist interviews.\n• Color grade short-form Reels and YouTube shorts.\n• Design promotional posters in Photoshop.\n• Collaborate with talent on release campaigns.`
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 bg-secondary/20 border border-border rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-foreground transition-all leading-relaxed"
        />

        {parsedPreview.length > 0 && (
          <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-1.5 text-xs">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Preview: {parsedPreview.length} separate items detected
            </span>
            <div className="max-h-28 overflow-y-auto space-y-1 text-muted-foreground text-[11px]">
              {parsedPreview.map((item, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">&bull;</span>
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground select-none">
            <input
              type="checkbox"
              checked={replace}
              onChange={(e) => setReplace(e.target.checked)}
              className="rounded border-border text-foreground focus:ring-0"
            />
            <span>Replace existing items (instead of adding to the bottom)</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={parsedPreview.length === 0}
            className="px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-semibold hover:bg-foreground/90 disabled:opacity-50"
          >
            Add {parsedPreview.length > 0 ? `${parsedPreview.length} Items` : "Items"}
          </button>
        </div>
      </div>
    </div>
  );
}
