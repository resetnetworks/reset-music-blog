"use client";

import { useState, useEffect } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  const headings = content.split("\n").filter((line) => line.startsWith("#"));

  const items: TocItem[] = headings
    .map((heading) => {
      const match = heading.match(/^(#{1,3})\s+(.+)$/);
      if (!match) return null;
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      return { id, text, level };
    })
    .filter(Boolean) as TocItem[];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (items.length < 2) return null;

  return (
    <nav className="space-y-1">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Table of Contents
      </h4>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item.id)}
          className={`block text-left w-full py-1 transition-colors ${
            item.level === 1
              ? "text-sm font-medium"
              : item.level === 2
              ? "text-sm pl-3"
              : "text-xs pl-6"
          } ${
            activeId === item.id
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground/70"
          }`}
        >
          {item.text}
        </button>
      ))}
    </nav>
  );
}
