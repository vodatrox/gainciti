"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/client";
import type { PaginatedResponse, Tag } from "@/lib/types";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<PaginatedResponse<Tag>>("/admin/tags/", {
        params: { page: String(page) },
      });
      setTags(res.results);
      setTotalCount(res.count);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await adminFetch("/admin/tags/", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName("");
      fetchTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await adminFetch(`/admin/tags/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName.trim() }),
      });
      setEditingId(null);
      fetchTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this tag?")) return;
    await adminFetch(`/admin/tags/${id}/`, { method: "DELETE" });
    fetchTags();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {totalCount} tag{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Create form */}
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New tag name..."
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
        />
        <button
          onClick={handleCreate}
          disabled={saving || !newName.trim()}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          Add Tag
        </button>
      </div>

      {/* Tags table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Name</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Slug</th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-text-secondary">
                  Loading...
                </td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-text-secondary">
                  No tags yet
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {editingId === tag.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(tag.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="rounded border border-primary-300 px-2 py-1 text-sm outline-none"
                      />
                    ) : (
                      <span className="font-medium">{tag.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{tag.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === tag.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(tag.id)}
                            disabled={saving}
                            className="rounded px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded px-2 py-1 text-xs font-medium text-text-secondary hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(tag.id);
                              setEditName(tag.name);
                            }}
                            className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </>
                      )}
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
