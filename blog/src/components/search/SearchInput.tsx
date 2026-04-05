"use client";

import { useRouter } from "next/navigation";
import { useSearch } from "@/lib/hooks/useSearch";
import Link from "next/link";
import { useState } from "react";

export function SearchInput() {
  const router = useRouter();
  const { query, setQuery, suggestions, isLoading } = useSearch();
  const [isFocused, setIsFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search articles..."
          className="h-9 w-full rounded-lg border border-gray-200 bg-surface-secondary pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-text-secondary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-surface-dark-secondary sm:w-64"
        />
      </div>

      {/* Autocomplete dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-gray-200 bg-surface shadow-lg dark:border-gray-700">
          {suggestions.map((item) => (
            <Link
              key={item.slug}
              href={`/posts/${item.slug}`}
              className="block px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </form>
  );
}
