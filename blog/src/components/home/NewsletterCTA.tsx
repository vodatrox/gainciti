"use client";

import { useState } from "react";
import { subscribe } from "@/lib/api/newsletter";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const result = await subscribe(email);
      setStatus("success");
      setMessage(result.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="bg-brand-dark">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">
            Stay in the loop
          </h2>
          <p className="mt-3 text-gray-300">
            Get the latest articles and insights delivered straight to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="h-12 rounded-lg bg-white/10 px-4 text-white placeholder:text-gray-400 outline-none ring-1 ring-white/20 backdrop-blur-sm focus:ring-2 focus:ring-brand-green sm:w-80"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-12 rounded-lg bg-brand-green px-6 font-medium text-brand-dark transition-colors hover:bg-primary-300 disabled:opacity-50"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          {message && (
            <p className={`mt-3 text-sm ${status === "error" ? "text-red-200" : "text-primary-100"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
