import { API_URL } from "@/lib/constants";

export async function sendPageView(path: string, referrer: string) {
  const sessionId =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("gc_sid") ??
        (() => {
          const id = crypto.randomUUID();
          sessionStorage.setItem("gc_sid", id);
          return id;
        })())
      : "";

  try {
    await fetch(`${API_URL}/analytics/event/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer, session_id: sessionId }),
      keepalive: true,
    });
  } catch {
    // Fire-and-forget: don't block UI on analytics failure
  }
}
