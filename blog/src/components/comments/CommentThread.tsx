"use client";

import { useState } from "react";
import type { Comment } from "@/lib/api/comments";
import { formatRelativeDate } from "@/lib/utils/formatDate";
import { CommentForm } from "./CommentForm";

interface CommentThreadProps {
  comment: Comment;
  postSlug: string;
  depth?: number;
}

export function CommentThread({ comment, postSlug, depth = 0 }: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-gray-200 pl-4 dark:border-gray-700" : ""}>
      <div className="py-4">
        {/* Comment header */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
            {comment.author_name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{comment.author_name}</p>
            <p className="text-xs text-text-secondary">
              {formatRelativeDate(comment.created_at)}
            </p>
          </div>
        </div>

        {/* Comment body */}
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {comment.body}
        </p>

        {/* Reply button */}
        {depth < 2 && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            {showReplyForm ? "Cancel Reply" : "Reply"}
          </button>
        )}

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              postSlug={postSlug}
              parentId={comment.id}
              compact
              onSuccess={() => setShowReplyForm(false)}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {/* Nested replies */}
      {comment.replies?.map((reply) => (
        <CommentThread
          key={reply.id}
          comment={reply}
          postSlug={postSlug}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
