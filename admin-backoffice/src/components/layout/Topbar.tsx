"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

const BREADCRUMB_LABELS: Record<string, string> = {
  posts: "Posts",
  new: "New",
  edit: "Edit",
  categories: "Categories",
  tags: "Tags",
  media: "Media",
  comments: "Comments",
  analytics: "Analytics",
  newsletters: "Newsletter",
  campaigns: "Campaigns",
  users: "Users",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = BREADCRUMB_LABELS[seg] || seg;
    return { label, href };
  });

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.email[0].toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-lg">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
          Dashboard
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <Link href={crumb.href} className="text-text-secondary hover:text-text-primary transition-colors capitalize">
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
            {initials}
          </div>
          {user && (
            <span className="hidden text-sm font-medium sm:block">
              {user.first_name || user.email}
            </span>
          )}
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            {user && (
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-medium">{user.full_name || user.email}</p>
                <p className="text-xs text-text-secondary">{user.email}</p>
                <span className="mt-1 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-600">
                  {user.role}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
