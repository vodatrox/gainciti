import Image from "next/image";
import Link from "next/link";
import type { PostDetail } from "@/lib/types/post";
import { formatDate } from "@/lib/utils/formatDate";

interface ArticleHeaderProps {
  post: PostDetail;
}

export function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <header className="mb-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${post.category.slug}`}
          className="hover:text-primary-600 transition-colors"
        >
          {post.category.name}
        </Link>
        <span>/</span>
        <span className="text-text-primary truncate">{post.title}</span>
      </nav>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
        <Link
          href={`/categories/${post.category.slug}`}
          className="rounded-full px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: post.category.color }}
        >
          {post.category.name}
        </Link>
        {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
        <span>&middot;</span>
        <span>{post.reading_time_minutes} min read</span>
        {post.view_count > 0 && (
          <>
            <span>&middot;</span>
            <span>{post.view_count.toLocaleString()} views</span>
          </>
        )}
      </div>

      {/* Title */}
      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="mt-4 text-lg leading-relaxed text-text-secondary">
        {post.excerpt}
      </p>

      {/* Author */}
      <AuthorMini author={post.author} publishedAt={post.published_at} />

      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-2xl">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
          />
        </div>
      )}
    </header>
  );
}

function AuthorMini({
  author,
  publishedAt,
}: {
  author: PostDetail["author"];
  publishedAt: string | null;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.full_name}
          width={44}
          height={44}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
          {author.first_name[0]}
          {author.last_name[0]}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold">{author.full_name}</p>
        {publishedAt && (
          <p className="text-xs text-text-secondary">
            Published on{" "}
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          </p>
        )}
      </div>
    </div>
  );
}
