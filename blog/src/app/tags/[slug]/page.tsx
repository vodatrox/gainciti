import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostsByTag, getTagBySlug } from "@/lib/api/posts";
import { SITE_NAME } from "@/lib/constants";
import { PostCard } from "@/components/posts/PostCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tag = await getTagBySlug(slug);
    return {
      title: `#${tag.name} - ${SITE_NAME}`,
      description: `Articles tagged with #${tag.name}`,
    };
  } catch {
    return { title: "Tag Not Found" };
  }
}

export const revalidate = 60;

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;

  let tag;
  let posts;
  try {
    tag = await getTagBySlug(slug);
    const data = await getPostsByTag(slug);
    posts = data.results;
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-text-secondary hover:text-primary-600 transition-colors"
        >
          &larr; Back to Home
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg dark:bg-primary-900">
            #
          </span>
          <div>
            <h1 className="text-3xl font-bold">{tag.name}</h1>
            <p className="mt-1 text-text-secondary">
              {posts.length} article{posts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Posts grid */}
      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-text-secondary">No articles with this tag yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700 transition-colors"
          >
            Browse all articles
          </Link>
        </div>
      )}
    </div>
  );
}
