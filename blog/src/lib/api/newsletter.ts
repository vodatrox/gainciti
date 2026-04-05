import { apiFetch } from "./client";

export async function subscribe(email: string) {
  return apiFetch<{ message: string }>("/newsletter/subscribe/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
