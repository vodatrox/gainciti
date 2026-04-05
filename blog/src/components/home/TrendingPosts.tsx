import { PostCard } from "@/components/posts/PostCard";
import type { Post } from "@/lib/types/post";

interface TrendingPostsProps {
  posts: Post[];
}

export function TrendingPosts({ posts }: TrendingPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold">Trending</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {posts.slice(0, 5).map((post, index) => (
          <div key={post.id} className="flex items-start gap-4">
            <span className="shrink-0 text-3xl font-bold text-primary-200 dark:text-primary-800">
              {String(index + 1).padStart(2, "0")}
            </span>
            <PostCard post={post} variant="compact" />
          </div>
        ))}
      </div>
    </section>
  );
}
