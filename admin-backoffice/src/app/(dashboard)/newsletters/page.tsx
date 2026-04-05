"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { adminFetch } from "@/lib/api/client";
import type { PaginatedResponse, Subscriber } from "@/lib/types";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<PaginatedResponse<Subscriber>>(
        "/admin/newsletter/subscribers/",
        { params: { page: String(page) } },
      );
      setSubscribers(res.results);
      setTotalCount(res.count);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const exportCSV = () => {
    const header = "Email,Confirmed,Subscribed At\n";
    const rows = subscribers
      .map(
        (s) =>
          `${s.email},${s.is_confirmed},${s.subscribed_at}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Newsletter</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {totalCount} subscriber{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Export CSV
          </button>
          <Link
            href="/newsletters/campaigns/new"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            New Campaign
          </Link>
        </div>
      </div>

      {/* Subscribers table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Email</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Subscribed</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Unsubscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-text-secondary">
                  Loading...
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-text-secondary">
                  No subscribers yet
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        sub.unsubscribed_at
                          ? "bg-gray-100 text-gray-600"
                          : sub.is_confirmed
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {sub.unsubscribed_at
                        ? "Unsubscribed"
                        : sub.is_confirmed
                          ? "Confirmed"
                          : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {format(new Date(sub.subscribed_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {sub.unsubscribed_at
                      ? format(new Date(sub.unsubscribed_at), "MMM d, yyyy")
                      : "—"}
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
