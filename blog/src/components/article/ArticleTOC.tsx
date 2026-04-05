"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function ArticleTOC() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const articleBody = document.querySelector(".article-body");
    if (!articleBody) return;

    const elements = articleBody.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    elements.forEach((el, i) => {
      if (!el.id) {
        el.id = `heading-${i}`;
      }
      items.push({
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="sticky top-24" aria-label="Table of contents">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        On this page
      </p>
      <ul className="space-y-1 border-l-2 border-gray-200 dark:border-gray-700">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block border-l-2 -ml-[2px] py-1 text-sm transition-colors",
                heading.level === 3 ? "pl-6" : "pl-4",
                activeId === heading.id
                  ? "border-primary-500 font-medium text-primary-600"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-gray-400",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
