import { API_URL } from "@/lib/constants";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function refreshToken(): Promise<string | null> {
  const refresh = localStorage.getItem("gc_refresh");
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    localStorage.removeItem("gc_access");
    localStorage.removeItem("gc_refresh");
    window.location.href = "/login";
    return null;
  }

  const data = await res.json();
  localStorage.setItem("gc_access", data.access);
  if (data.refresh) {
    localStorage.setItem("gc_refresh", data.refresh);
  }
  return data.access;
}

export async function adminFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  let token = localStorage.getItem("gc_access");

  const isFormData = fetchOptions.body instanceof FormData;
  const buildHeaders = (t: string | null) => ({
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...fetchOptions.headers,
  });

  let response = await fetch(url, {
    ...fetchOptions,
    headers: buildHeaders(token),
  });

  // Auto-refresh on 401
  if (response.status === 401) {
    token = await refreshToken();
    if (token) {
      response = await fetch(url, {
        ...fetchOptions,
        headers: buildHeaders(token),
      });
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData?.error?.code || "unknown",
      errorData?.error?.message || `HTTP ${response.status}`,
    );
  }

  if (response.status === 204) return {} as T;
  return response.json();
}
