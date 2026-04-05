import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-surface-secondary dark:border-gray-800 dark:bg-surface-dark-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
                G
              </div>
              <span className="text-lg font-bold tracking-tight">
                Gain<span className="text-primary-600">Citi</span>
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-text-secondary">
              Insights, trends, and strategies for modern finance and growth.
              Stay ahead with our curated content.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
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
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Connect
            </h3>
            <ul className="mt-4 space-y-2">
              {["Twitter", "LinkedIn", "GitHub"].map((name) => (
                <li key={name}>
                  <span className="text-sm text-text-secondary">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
          <p className="text-center text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} GainCiti. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
