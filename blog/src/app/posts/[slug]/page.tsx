import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPostsByCategory } from "@/lib/api/posts";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import {
  ArticleHeader,
  ArticleBody,
  AuthorCard,
  SocialShareBar,
  ArticleTOC,
  RelatedArticles,
  ReadingProgressBar,
} from "@/components/article";
import { CommentSection } from "@/components/comments";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.published_at || undefined,
        modifiedTime: post.updated_at,
        authors: [post.author.full_name],
        section: post.category.name,
        tags: post.tags.map((t) => t.name),
        url: `${SITE_URL}/posts/${post.slug}`,
        images: post.featured_image_url ? [{ url: post.featured_image_url }] : [],
        siteName: SITE_NAME,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: post.featured_image_url ? [post.featured_image_url] : [],
      },
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export const revalidate = 300;

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  // Fetch related posts from same category (exclude current post)
  let relatedPosts: import("@/lib/types/post").Post[] = [];
  try {
    const categoryPosts = await getPostsByCategory(post.category.slug);
    relatedPosts = categoryPosts.results
      .filter((p) => p.id !== post.id)
      .slice(0, 3);
  } catch {
    // Keep empty array
  }

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image_url || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author.full_name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/posts/${post.slug}`,
    },
    articleSection: post.category.name,
    wordCount: post.reading_time_minutes * 200,
  };

  return (
    <>
      <ReadingProgressBar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-10">
          {/* Main content */}
          <article className="max-w-3xl">
            <ArticleHeader post={post} />

            {/* Share bar */}
            <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6 dark:border-gray-800">
              <SocialShareBar title={post.title} slug={post.slug} />
            </div>

            {/* Article body */}
            <ArticleBody html={post.body_html} />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-gray-200 pt-6 dark:border-gray-800">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-primary-100 hover:text-primary-700 dark:bg-gray-800 dark:hover:bg-primary-900 dark:hover:text-primary-300"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Share bar bottom */}
            <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
              <SocialShareBar title={post.title} slug={post.slug} />
            </div>

            {/* Author card */}
            <div className="mt-8">
              <AuthorCard author={post.author} />
            </div>

            {/* Related articles */}
            <RelatedArticles posts={relatedPosts} />

            {/* Comments */}
            <CommentSection postSlug={post.slug} />
          </article>

          {/* Sidebar - TOC */}
          <aside className="hidden lg:block">
            <ArticleTOC />
          </aside>
        </div>
      </div>
    </>
  );
}
