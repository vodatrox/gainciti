import { getComments } from "@/lib/api/comments";
import { CommentThread } from "./CommentThread";
import { CommentForm } from "./CommentForm";

interface CommentSectionProps {
  postSlug: string;
}

export async function CommentSection({ postSlug }: CommentSectionProps) {
  let comments: import("@/lib/api/comments").Comment[] = [];
  try {
    comments = await getComments(postSlug);
  } catch {
    // Keep empty array
  }

  return (
    <section className="mt-12 border-t border-gray-200 pt-10 dark:border-gray-800">
      <h2 className="text-2xl font-bold">
        Comments{" "}
        {comments.length > 0 && (
          <span className="text-base font-normal text-text-secondary">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-800">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-secondary">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}

      {/* Comment form */}
      <div className="mt-8">
        <CommentForm postSlug={postSlug} />
      </div>
    </section>
  );
}
