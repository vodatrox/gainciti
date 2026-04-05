"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendPageView } from "@/lib/api/analytics";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const referrer = document.referrer;
    sendPageView(pathname, referrer);
  }, [pathname, searchParams]);

  return null;
}
