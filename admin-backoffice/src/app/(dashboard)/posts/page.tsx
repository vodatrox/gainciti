"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { adminFetch } from "@/lib/api/client";
import { toast } from "@/components/common/Toast";
import { confirmModal } from "@/components/common/ConfirmModal";
import { cn } from "@/lib/utils/cn";
import type {
  Category,
  PaginatedResponse,
  PostListItem,
  PostStatus,
} from "@/lib/types";

const STATUS_STYLES: Record<PostStatus, string> = {
  published: "bg-green-50 text-green-700",
  draft: "bg-yellow-50 text-yellow-700",
  scheduled: "bg-blue-50 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
};

export default function PostsPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const res = await adminFetch<PaginatedResponse<PostListItem>>(
        "/admin/posts/",
        { params },
      );
      setPosts(res.results);
      setTotalCount(res.count);
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminFetch<PaginatedResponse<Category>>(
        "/admin/categories/",
        { params: { page_size: "100" } },
      );
      setCategories(res.results);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map((p) => p.id)));
    }
  };

  const bulkDelete = async () => {
    const ok = await confirmModal({
      title: "Delete posts",
      message: `${selected.size} post(s) will be archived. This action can be reversed from the database.`,
      confirmLabel: "Delete all",
      variant: "danger",
    });
    if (!ok) return;
    setBulkLoading(true);
    try {
      const count = selected.size;
      await Promise.all(
        Array.from(selected).map((id) =>
          adminFetch(`/admin/posts/${id}/`, { method: "DELETE" }),
        ),
      );
      toast.success(`${count} post(s) archived`);
      setSelected(new Set());
      fetchPosts();
    } catch (err) {
      toast.error("Delete failed", err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkPublish = async () => {
    setBulkLoading(true);
    try {
      const count = selected.size;
      await Promise.all(
        Array.from(selected).map((id) =>
          adminFetch(`/admin/posts/${id}/publish/`, { method: "POST" }),
        ),
      );
      toast.success(`${count} post(s) published`);
      setSelected(new Set());
      fetchPosts();
    } catch (err) {
      toast.error("Publish failed", err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setBulkLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    const ok = await confirmModal({
      title: "Delete post",
      message: "This post will be archived. This action can be reversed from the database.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await adminFetch(`/admin/posts/${id}/`, { method: "DELETE" });
      toast.success("Post archived");
      fetchPosts();
    } catch (err) {
      toast.error("Delete failed", err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {totalCount} total post{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/posts/new"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          New Post
        </Link>
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters((f) => ({ ...f, status: e.target.value }));
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => {
            setFilters((f) => ({ ...f, category: e.target.value }));
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search posts..."
          value={filters.search}
          onChange={(e) => {
            setFilters((f) => ({ ...f, search: e.target.value }));
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
        />

        {selected.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              {selected.size} selected
            </span>
            <button
              onClick={bulkPublish}
              disabled={bulkLoading}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Publish
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkLoading}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Posts table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={posts.length > 0 && selected.size === posts.length}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Title
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Author
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Category
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Views
              </th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                  Loading...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                  No posts found. Create your first post.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(post.id)}
                      onChange={() => toggleSelect(post.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="font-medium text-text-primary hover:text-primary-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {post.author?.full_name || post.author?.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {post.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        STATUS_STYLES[post.status] || STATUS_STYLES.draft,
                      )}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {post.published_at
                      ? format(new Date(post.published_at), "MMM d, yyyy")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {post.view_count?.toLocaleString() ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/posts/${post.id}/edit`}
                        className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
