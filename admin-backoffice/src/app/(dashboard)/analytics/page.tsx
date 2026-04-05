"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminFetch } from "@/lib/api/client";
import type { AnalyticsOverview } from "@/lib/types";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const overview = await adminFetch<AnalyticsOverview>(
        "/admin/analytics/overview/",
        { params },
      );
      setData(overview);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Site traffic and engagement metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <span className="text-text-secondary">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Views", value: data?.total_views ?? 0 },
          { label: "Unique Visitors", value: data?.total_unique_visitors ?? 0 },
          { label: "Total Posts", value: data?.total_posts ?? 0 },
          {
            label: "Bounce Rate",
            value: data?.avg_bounce_rate != null ? `${data.avg_bounce_rate.toFixed(1)}%` : "N/A",
            raw: true,
          },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-text-secondary">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {loading ? "—" : "raw" in card ? card.value : formatNumber(card.value as number)}
            </p>
          </div>
        ))}
      </div>

      {/* Views chart */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Traffic Over Time</h2>
        <div className="mt-4 h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center text-text-secondary">
              Loading...
            </div>
          ) : data?.views_trend && data.views_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.views_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                <Line type="monotone" dataKey="views" stroke="#22C55E" strokeWidth={2} dot={false} name="Views" />
                <Line type="monotone" dataKey="unique_visitors" stroke="#10B981" strokeWidth={2} dot={false} name="Unique Visitors" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-text-secondary">
              No analytics data available for this period
            </div>
          )}
        </div>
      </div>

      {/* Top posts table */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Top Posts</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-text-secondary">#</th>
                <th className="px-4 py-2.5 text-left font-medium text-text-secondary">Title</th>
                <th className="px-4 py-2.5 text-right font-medium text-text-secondary">Views</th>
                <th className="px-4 py-2.5 text-right font-medium text-text-secondary">Unique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                    Loading...
                  </td>
                </tr>
              ) : !data?.top_posts?.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                    No data yet
                  </td>
                </tr>
              ) : (
                data.top_posts.map((post, i) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-text-secondary">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{post.title}</td>
                    <td className="px-4 py-2.5 text-right">{formatNumber(post.view_count ?? 0)}</td>
                    <td className="px-4 py-2.5 text-right">{formatNumber(post.unique_visitors ?? 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
