import Link from "next/link";
import { getCategories } from "@/lib/api/posts";

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await getCategories().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Categories</h1>
      <p className="mt-2 text-text-secondary">Browse articles by topic</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group rounded-xl border border-gray-200 p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-800"
          >
            <div
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white text-lg font-bold"
              style={{ backgroundColor: category.color }}
            >
              {category.name[0]}
            </div>
            <h2 className="mt-3 text-lg font-bold group-hover:text-primary-600 transition-colors">
              {category.name}
            </h2>
            {category.description && (
              <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                {category.description}
              </p>
            )}
            {category.post_count !== undefined && (
              <p className="mt-2 text-xs text-text-secondary">
                {category.post_count} article{category.post_count !== 1 ? "s" : ""}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
