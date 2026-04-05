"use client";

import { useState } from "react";
import { submitComment } from "@/lib/api/comments";

interface CommentFormProps {
  postSlug: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function CommentForm({
  postSlug,
  parentId,
  onSuccess,
  onCancel,
  compact = false,
}: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await submitComment(postSlug, {
        author_name: name,
        author_email: email,
        body,
        parent: parentId,
      });
      setStatus("success");
      setName("");
      setEmail("");
      setBody("");
      onSuccess?.();
    } catch {
      setStatus("error");
      setErrorMessage("Failed to submit comment. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-accent-500/30 bg-accent-500/5 p-4 text-sm text-accent-600 dark:text-accent-500">
        Your comment has been submitted and is awaiting moderation.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!compact && (
        <h3 className="text-lg font-semibold">
          {parentId ? "Reply" : "Leave a Comment"}
        </h3>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="comment-name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="comment-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="comment-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="comment-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="comment-body" className="block text-sm font-medium mb-1">
          Comment
        </label>
        <textarea
          id="comment-body"
          required
          rows={compact ? 3 : 4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 resize-none"
          placeholder="Share your thoughts..."
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {status === "loading" ? "Submitting..." : parentId ? "Post Reply" : "Post Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
