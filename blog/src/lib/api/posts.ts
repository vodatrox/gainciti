import { apiFetch } from "./client";
import type { Post, PostDetail } from "@/lib/types/post";
import type { Category } from "@/lib/types/post";
import type { CursorPaginatedResponse, AutocompleteResult } from "@/lib/types/api";

export async function getPosts(params?: Record<string, string>) {
  return apiFetch<CursorPaginatedResponse<Post>>("/posts/", { params });
}

export async function getPostBySlug(slug: string) {
  return apiFetch<PostDetail>(`/posts/${slug}/`);
}

export async function getFeaturedPosts() {
  return apiFetch<Post[]>("/posts/featured/");
}

export async function getTrendingPosts(days = 7) {
  return apiFetch<Post[]>("/posts/trending/", {
    params: { days: days.toString() },
  });
}

export async function searchPosts(query: string, cursor?: string) {
  const params: Record<string, string> = { q: query };
  if (cursor) params.cursor = cursor;
  return apiFetch<CursorPaginatedResponse<Post>>("/posts/search/", { params });
}

export async function getAutocomplete(query: string) {
  return apiFetch<AutocompleteResult[]>("/posts/search/autocomplete/", {
    params: { q: query },
  });
}

export async function getCategories() {
  return apiFetch<Category[]>("/categories/");
}

export async function getCategoryBySlug(slug: string) {
  return apiFetch<Category>(`/categories/${slug}/`);
}

export async function getPostsByCategory(slug: string, cursor?: string) {
  const params: Record<string, string> = { category: slug };
  if (cursor) params.cursor = cursor;
  return apiFetch<CursorPaginatedResponse<Post>>("/posts/", { params });
}

export async function getPostsByTag(slug: string, cursor?: string) {
  const params: Record<string, string> = { tag: slug };
  if (cursor) params.cursor = cursor;
  return apiFetch<CursorPaginatedResponse<Post>>("/posts/", { params });
}

export async function getTagBySlug(slug: string) {
  return apiFetch<{ id: number; name: string; slug: string }>(`/tags/${slug}/`);
}
