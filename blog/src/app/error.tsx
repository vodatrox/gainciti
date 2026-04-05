"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-primary-600">Oops</h1>
      <p className="mt-4 text-lg text-text-secondary">
        Something went wrong while loading this page.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
