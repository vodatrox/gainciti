import Image from "next/image";
import type { Author } from "@/lib/types/post";

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-surface-secondary p-6 dark:border-gray-800">
      <div className="flex items-start gap-4">
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt={author.full_name}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
            {author.first_name[0]}
            {author.last_name[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Written by
          </p>
          <p className="mt-1 text-lg font-bold">{author.full_name}</p>
          {author.bio && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {author.bio}
            </p>
          )}
          <div className="mt-3 flex gap-3">
            {author.social_twitter && (
              <a
                href={`https://twitter.com/${author.social_twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Twitter
              </a>
            )}
            {author.social_linkedin && (
              <a
                href={`https://linkedin.com/in/${author.social_linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
