import { notFound } from "next/navigation";
import { getCategoryBySlug, getPostsByCategory } from "@/lib/api/posts";
import { PostCard } from "@/components/posts/PostCard";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    return { title: category.name, description: category.description };
  } catch {
    return { title: "Category Not Found" };
  }
}

export const revalidate = 60;

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  let category;
  let posts;
  try {
    [category, posts] = await Promise.all([
      getCategoryBySlug(slug),
      getPostsByCategory(slug),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-lg text-white text-xl font-bold"
          style={{ backgroundColor: category.color }}
        >
          {category.name[0]}
        </div>
        <h1 className="mt-4 text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-text-secondary">{category.description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.results.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.results.length === 0 && (
        <p className="text-center text-text-secondary">No articles in this category yet.</p>
      )}
    </div>
  );
}
