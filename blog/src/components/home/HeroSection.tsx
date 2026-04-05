import { PostCard } from "@/components/posts/PostCard";
import type { Post } from "@/lib/types/post";

interface HeroSectionProps {
  posts: Post[];
}

export function HeroSection({ posts }: HeroSectionProps) {
  if (posts.length === 0) return null;

  const [primary, ...secondary] = posts;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Primary featured post */}
        <div className="md:col-span-2">
          <PostCard post={primary} variant="large" />
        </div>
        {/* Secondary featured posts */}
        <div className="flex flex-col gap-6">
          {secondary.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
