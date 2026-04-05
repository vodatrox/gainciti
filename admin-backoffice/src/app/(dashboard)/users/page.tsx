"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { adminFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import type { PaginatedResponse, User } from "@/lib/types";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700",
  editor: "bg-blue-50 text-blue-700",
  author: "bg-green-50 text-green-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "author" as "admin" | "editor" | "author",
  });
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; role: string } | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<User[] | PaginatedResponse<User>>("/admin/users/");
      if (Array.isArray(res)) {
        setUsers(res);
        setTotalCount(res.length);
      } else {
        setUsers(res.results);
        setTotalCount(res.count);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async () => {
    if (!form.email || !form.password) return;
    setSaving(true);
    try {
      await adminFetch("/admin/users/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowCreate(false);
      setForm({ email: "", first_name: "", last_name: "", password: "", role: "author" });
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await adminFetch(`/admin/users/${userId}/`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setEditingRole(null);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {totalCount} user{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Add User
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold">Create New User</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as typeof f.role }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="author">Author</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || !form.email || !form.password}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">User</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Email</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Role</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Joined</th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                        {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                      </div>
                      <span className="font-medium">
                        {user.full_name || user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                  <td className="px-4 py-3">
                    {editingRole?.id === user.id ? (
                      <select
                        value={editingRole.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                        className="rounded border border-primary-300 px-2 py-1 text-xs"
                      >
                        <option value="author">Author</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingRole({ id: user.id, role: user.role })}
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize cursor-pointer hover:opacity-80",
                          ROLE_STYLES[user.role] || "bg-gray-100 text-gray-600",
                        )}
                        title="Click to change role"
                      >
                        {user.role}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingRole({ id: user.id, role: user.role })}
                      className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                      title="Edit role"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
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
