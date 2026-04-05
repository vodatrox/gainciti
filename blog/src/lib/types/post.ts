export interface Author {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  avatar: string | null;
  bio: string;
  social_twitter: string;
  social_linkedin: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  post_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  author: Author;
  category: Category;
  tags: Tag[];
  status: "draft" | "published" | "scheduled" | "archived";
  is_featured: boolean;
  position: string;
  reading_time_minutes: number;
  published_at: string | null;
  view_count: number;
}

export interface PostDetail extends Post {
  body: Record<string, unknown>;
  body_html: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}
