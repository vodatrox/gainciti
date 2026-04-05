import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getPosts, getCategories } from "@/lib/api/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Add all categories
  try {
    const categories = await getCategories();
    for (const category of categories) {
      entries.push({
        url: `${SITE_URL}/categories/${category.slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Skip categories if API unavailable
  }

  // Add all published posts
  try {
    const data = await getPosts();
    for (const post of data.results) {
      entries.push({
        url: `${SITE_URL}/posts/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // Skip posts if API unavailable
  }

  return entries;
}
