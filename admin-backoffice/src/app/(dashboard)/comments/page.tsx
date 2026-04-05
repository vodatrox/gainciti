"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { adminFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import type { Comment, PaginatedResponse } from "@/lib/types";

type FilterStatus = "" | "true" | "false";

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<FilterStatus>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  const pendingCount = comments.filter((c) => !c.is_approved).length;

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (filter) params.is_approved = filter;
      const res = await adminFetch<PaginatedResponse<Comment>>(
        "/admin/comments/",
        { params },
      );
      setComments(res.results);
      setTotalCount(res.count);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const approveComment = async (id: string) => {
    setActionLoading(id);
    try {
      await adminFetch(`/admin/comments/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_approved: true }),
      });
      fetchComments();
    } finally {
      setActionLoading(null);
    }
  };

  const rejectComment = async (id: string) => {
    if (!confirm("Delete this comment permanently?")) return;
    setActionLoading(id);
    try {
      await adminFetch(`/admin/comments/${id}/`, { method: "DELETE" });
      fetchComments();
    } finally {
      setActionLoading(null);
    }
  };

  const bulkApprove = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          adminFetch(`/admin/comments/${id}/`, {
            method: "PATCH",
            body: JSON.stringify({ is_approved: true }),
          }),
        ),
      );
      setSelected(new Set());
      fetchComments();
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} comment(s) permanently?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          adminFetch(`/admin/comments/${id}/`, { method: "DELETE" }),
        ),
      );
      setSelected(new Set());
      fetchComments();
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === comments.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(comments.map((c) => c.id)));
    }
  };

  // Group comments by post
  const grouped = comments.reduce<
    Record<string, { title: string; slug: string; comments: Comment[] }>
  >((acc, comment) => {
    const key = comment.post;
    if (!acc[key]) {
      acc[key] = {
        title: comment.post_title,
        slug: comment.post_slug,
        comments: [],
      };
    }
    acc[key].comments.push(comment);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {totalCount} comment{totalCount !== 1 ? "s" : ""}
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                {pendingCount} pending on this page
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
          {([
            { value: "", label: "All" },
            { value: "false", label: "Pending" },
            { value: "true", label: "Approved" },
          ] as { value: FilterStatus; label: string }[]).map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilter(tab.value);
                setPage(1);
                setSelected(new Set());
              }}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === tab.value
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              {selected.size} selected
            </span>
            <button
              onClick={bulkApprove}
              disabled={bulkLoading}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {bulkLoading ? "Working..." : "Approve Selected"}
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkLoading}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Comments grouped by post */}
      <div className="mt-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-text-secondary">
            <svg className="h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <p className="font-medium">No comments found</p>
            <p className="mt-1 text-sm">
              {filter === "false" ? "No pending comments to review." : "Comments will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* Select all */}
            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                checked={comments.length > 0 && selected.size === comments.length}
                onChange={toggleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-text-secondary">Select all on this page</span>
            </div>

            {Object.entries(grouped).map(([postId, group]) => (
              <div key={postId} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Post header */}
                <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-3">
                  <svg className="h-4 w-4 shrink-0 text-text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {group.title}
                  </span>
                  <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                    {group.comments.length} comment{group.comments.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Comments for this post */}
                <div className="divide-y divide-gray-100">
                  {group.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={cn(
                        "flex gap-3 px-5 py-4 transition-colors",
                        !comment.is_approved && "bg-yellow-50/40",
                        actionLoading === comment.id && "opacity-50",
                      )}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selected.has(comment.id)}
                        onChange={() => toggleSelect(comment.id)}
                        className="mt-1 shrink-0 rounded"
                      />

                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                        {comment.author_name[0].toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        {/* Meta line */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold">{comment.author_name}</span>
                          {comment.author_email && (
                            <span className="text-xs text-text-secondary">{comment.author_email}</span>
                          )}
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                              comment.is_approved
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-100 text-yellow-700",
                            )}
                          >
                            {comment.is_approved ? "Approved" : "Pending"}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        {/* Reply indicator */}
                        {comment.parent && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-secondary">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                            </svg>
                            Replying to{" "}
                            <span className="font-medium text-text-primary">
                              {comment.parent_author || "a comment"}
                            </span>
                          </div>
                        )}

                        {/* Comment body */}
                        <p className="mt-2 text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
                          {comment.body}
                        </p>

                        {/* Inline replies preview */}
                        {comment.replies.length > 0 && (
                          <div className="mt-3 space-y-2 border-l-2 border-primary-200 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{reply.author_name}</span>
                                  <span
                                    className={cn(
                                      "inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                                      reply.is_approved
                                        ? "bg-green-50 text-green-700"
                                        : "bg-yellow-100 text-yellow-700",
                                    )}
                                  >
                                    {reply.is_approved ? "Approved" : "Pending"}
                                  </span>
                                  <span className="text-xs text-text-secondary">
                                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-text-secondary">{reply.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-start gap-1.5">
                        {!comment.is_approved && (
                          <button
                            onClick={() => approveComment(comment.id)}
                            disabled={actionLoading === comment.id}
                            className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                            title="Approve comment"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => rejectComment(comment.id)}
                          disabled={actionLoading === comment.id}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Page {page} of {totalPages} ({totalCount} total)
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); setSelected(new Set()); }}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setSelected(new Set()); }}
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
