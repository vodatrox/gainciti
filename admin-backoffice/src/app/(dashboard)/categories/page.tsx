"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/client";
import type { Category, PaginatedResponse } from "@/lib/types";

const DEFAULT_COLORS = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#64748B",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366F1", sort_order: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<PaginatedResponse<Category>>(
        "/admin/categories/",
        { params: { page_size: "100" } },
      );
      setCategories(res.results);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setForm({ name: "", description: "", color: "#6366F1", sort_order: 0 });
    setEditingId(null);
    setShowCreate(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await adminFetch(`/admin/categories/${editingId}/`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await adminFetch("/admin/categories/", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || "",
      color: cat.color || "#6366F1",
      sort_order: cat.sort_order || 0,
    });
    setShowCreate(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await adminFetch(`/admin/categories/${id}/`, { method: "DELETE" });
    fetchCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Organize your posts into categories
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Add Category
        </button>
      </div>

      {/* Create/Edit form */}
      {showCreate && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold">
            {editingId ? "Edit Category" : "New Category"}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                placeholder="Brief description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="h-9 w-9 cursor-pointer rounded border border-gray-200"
                />
                <div className="flex gap-1">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="h-6 w-6 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c,
                        borderColor: form.color === c ? "#1f2937" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Color</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Name</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Description</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Posts</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Order</th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                  No categories yet
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: cat.color || "#6366F1" }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{cat.slug}</td>
                  <td className="px-4 py-3 text-text-secondary truncate max-w-xs">
                    {cat.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {cat.post_count ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{cat.sort_order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600"
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
    </div>
  );
}
