import { HeroSection } from "@/components/home/HeroSection";
import { CategoryBar } from "@/components/home/CategoryBar";
import { RecentPosts } from "@/components/home/RecentPosts";
import { TrendingPosts } from "@/components/home/TrendingPosts";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";
import { getFeaturedPosts, getPosts, getTrendingPosts, getCategories } from "@/lib/api/posts";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, recent, trending, categories] = await Promise.all([
    getFeaturedPosts().catch(() => []),
    getPosts().catch(() => ({ results: [], next: null })),
    getTrendingPosts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  return (
    <>
      <HeroSection posts={featured} />
      <CategoryBar categories={categories} />
      <div className="mx-auto max-w-7xl gap-8 px-4 sm:px-6 lg:flex lg:px-8">
        <div className="flex-1">
          <RecentPosts
            initialPosts={recent.results}
            nextCursor={recent.next}
          />
        </div>
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-20">
            <TrendingPosts posts={trending} />
          </div>
        </aside>
      </div>
      <NewsletterCTA />
    </>
  );
}
