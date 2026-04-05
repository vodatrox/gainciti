import Link from "next/link";
import type { Category } from "@/lib/types/post";

interface CategoryBarProps {
  categories: Category[];
}

export function CategoryBar({ categories }: CategoryBarProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Link
          href="/"
          className="shrink-0 rounded-full border border-primary-600 bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="shrink-0 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary-500 hover:text-primary-600 dark:border-gray-700"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
