import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#152238] dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block">
              <Logo size="md" className="text-white" />
            </Link>
            <p className="mt-3 max-w-md text-sm text-gray-400">
              Insights, trends, and strategies for modern finance and growth.
              Stay ahead with our curated content.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Categories", href: "/categories" },
                { label: "About", href: "/about" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-[#3BE882]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Connect
            </h3>
            <ul className="mt-4 space-y-2">
              {["Twitter", "LinkedIn", "GitHub"].map((name) => (
                <li key={name}>
                  <span className="text-sm text-gray-300">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} GainCiti. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
