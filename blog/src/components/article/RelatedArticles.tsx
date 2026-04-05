import type { Post } from "@/lib/types/post";
import { PostCard } from "@/components/posts/PostCard";

interface RelatedArticlesProps {
  posts: Post[];
}

export function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-10 dark:border-gray-800">
      <h2 className="text-2xl font-bold">Related Articles</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
