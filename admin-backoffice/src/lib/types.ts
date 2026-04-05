// ── Pagination ──────────────────────────────────────────���───────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Users / Auth ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: "admin" | "editor" | "author";
  avatar: string | null;
  bio: string;
  social_twitter: string;
  social_linkedin: string;
  created_at: string;
}

// ── Posts ────────────────────────────────────────────────────────────────

export type PostStatus = "draft" | "published" | "scheduled" | "archived";
export type PostPosition = "hero" | "sidebar" | "trending" | "";

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

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  author: User;
  category: Category | null;
  tags: Tag[];
  status: PostStatus;
  is_featured: boolean;
  position: PostPosition;
  reading_time_minutes: number;
  published_at: string | null;
  view_count: number;
}

export interface PostDetail extends PostListItem {
  body: string;
  body_html: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostCreateUpdatePayload {
  title: string;
  slug?: string;
  excerpt?: string;
  body: string;
  featured_image?: number | null;
  category?: number | null;
  tag_ids?: number[];
  status?: PostStatus;
  is_featured?: boolean;
  is_pinned?: boolean;
  position?: PostPosition;
  scheduled_for?: string;
}

// ── Media ───────────────────────────────────────────────────────────────

export interface MediaAsset {
  id: number;
  file: string;
  file_url: string;
  filename: string;
  alt_text: string;
  caption: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  thumbnail: string | null;
  thumbnail_url: string | null;
  uploaded_by: string;
  created_at: string;
}

// ── Comments ────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  post: string;
  post_title: string;
  post_slug: string;
  parent: string | null;
  parent_author: string | null;
  author_name: string;
  author_email?: string;
  body: string;
  is_approved: boolean;
  created_at: string;
  replies: Comment[];
}

// ── Newsletter ──────────────────────────────────────────────────────────

export interface Subscriber {
  id: number;
  email: string;
  is_confirmed: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export type CampaignStatus = "draft" | "sending" | "sent";

export interface Campaign {
  id: number;
  subject: string;
  body_html: string;
  status: CampaignStatus;
  sent_at: string | null;
  created_by: string;
  created_at: string;
}

// ── Analytics ───────────────────────────────────────────────────────────

export interface ViewsTrendItem {
  date: string;
  views: number;
  unique_visitors: number;
}

export interface TopPostItem {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  views?: number;
  unique_visitors?: number;
}

export interface AnalyticsOverview {
  total_views: number;
  total_unique_visitors: number;
  avg_bounce_rate: number | null;
  total_posts: number;
  views_trend: ViewsTrendItem[];
  top_posts: TopPostItem[];
}
