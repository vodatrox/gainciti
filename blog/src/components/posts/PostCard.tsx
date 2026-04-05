import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types/post";
import { formatDate } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";

interface PostCardProps {
  post: Post;
  variant?: "default" | "large" | "compact";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/posts/${post.slug}`}
        className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            {post.reading_time_minutes} min read
          </p>
        </div>
      </Link>
    );
  }

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl border border-gray-200 bg-surface transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-800",
        variant === "large" && "md:col-span-2 md:row-span-2",
      )}
    >
      <Link href={`/posts/${post.slug}`} className="block">
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-gray-100 dark:bg-gray-800",
            variant === "large" ? "aspect-[16/9]" : "aspect-[16/10]",
          )}
        >
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={variant === "large" ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                <span className="text-2xl font-bold text-primary-600">
                  {post.title[0]}
                </span>
              </div>
            </div>
          )}
          {/* Category Badge */}
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: post.category.color }}
          >
            {post.category.name}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h2
            className={cn(
              "font-bold leading-tight line-clamp-2 transition-colors group-hover:text-primary-600",
              variant === "large" ? "text-xl md:text-2xl" : "text-base",
            )}
          >
            {post.title}
          </h2>
          <p className="mt-2 text-sm text-text-secondary line-clamp-2">
            {post.excerpt}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-text-secondary">
            <span className="font-medium text-text-primary">
              {post.author.full_name}
            </span>
            <span>&middot;</span>
            {post.published_at && <span>{formatDate(post.published_at)}</span>}
            <span>&middot;</span>
            <span>{post.reading_time_minutes} min read</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
