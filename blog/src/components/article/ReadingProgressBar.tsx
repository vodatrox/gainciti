"use client";

import { useReadingProgress } from "@/lib/hooks/useReadingProgress";

export function ReadingProgressBar() {
  const progress = useReadingProgress();

  return (
    <div
      className="reading-progress"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}
