import { searchPosts } from "@/lib/api/posts";
import { PostCard } from "@/components/posts/PostCard";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";
  const results = query ? await searchPosts(query).catch(() => ({ results: [], next: null })) : { results: [], next: null };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>
      {query && (
        <p className="mt-2 text-text-secondary">
          {results.results.length} result{results.results.length !== 1 ? "s" : ""} found
        </p>
      )}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.results.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {query && results.results.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg text-text-secondary">No articles found matching your search.</p>
          <p className="mt-2 text-sm text-text-secondary">Try different keywords or browse categories.</p>
        </div>
      )}
    </div>
  );
}
