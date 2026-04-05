import { apiFetch } from "./client";

export interface Comment {
  id: string;
  post: string;
  parent: string | null;
  author_name: string;
  body: string;
  is_approved: boolean;
  created_at: string;
  replies: Comment[];
}

export async function getComments(postSlug: string) {
  return apiFetch<Comment[]>(`/posts/${postSlug}/comments/`);
}

export async function submitComment(
  postSlug: string,
  data: { author_name: string; author_email: string; body: string; parent?: string },
) {
  return apiFetch<Comment>(`/posts/${postSlug}/comments/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
