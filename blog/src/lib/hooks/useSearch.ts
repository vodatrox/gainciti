"use client";

import { useEffect, useState } from "react";
import { getAutocomplete } from "@/lib/api/posts";
import type { AutocompleteResult } from "@/lib/types/api";

export function useSearch(debounceMs = 300) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await getAutocomplete(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { query, setQuery, suggestions, isLoading };
}
