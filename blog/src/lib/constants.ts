// Server-side URL (inside Docker network) vs client-side URL (browser)
export const API_URL = (typeof window === "undefined"
  ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:8000/api/v1";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SITE_NAME = "GainCiti";
export const SITE_DESCRIPTION = "Insights, trends, and strategies for modern finance and growth.";
export const DEFAULT_PAGE_SIZE = 12;
