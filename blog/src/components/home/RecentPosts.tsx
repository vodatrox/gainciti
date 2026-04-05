"use client";

import { useState } from "react";
import { PostCard } from "@/components/posts/PostCard";
import type { Post } from "@/lib/types/post";
import { getPosts } from "@/lib/api/posts";

interface RecentPostsProps {
  initialPosts: Post[];
  nextCursor: string | null;
}

export function RecentPosts({ initialPosts, nextCursor }: RecentPostsProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(nextCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const cursorParam = cursor.includes("cursor=")
        ? new URL(cursor).searchParams.get("cursor") || ""
        : cursor;
      const data = await getPosts({ cursor: cursorParam });
      setPosts((prev) => [...prev, ...data.results]);
      setCursor(data.next);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold">Recent Articles</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {cursor && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More Articles"}
          </button>
        </div>
      )}
    </section>
  );
}
