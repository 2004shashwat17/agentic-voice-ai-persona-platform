import Link from "next/link";
import { Mic2 } from "lucide-react";

import { navLinks, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/6 px-5 py-14 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
                <Mic2 className="h-4 w-4 text-ink-950" />
              </span>
              <span className="text-[15px] font-semibold text-white">
                {siteConfig.name}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-mist-500">
              {siteConfig.description} Built as a front-end prototype — voices
              and intelligence are simulated.
            </p>
          </div>

          <nav aria-label="Footer" className="flex gap-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                Product
              </p>
              <ul className="mt-4 space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-mist-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                Create
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/personas/create"
                    className="text-sm text-mist-400 transition-colors hover:text-white"
                  >
                    New persona
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="text-sm text-mist-400 transition-colors hover:text-white"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="hairline mt-12 h-px" />

        <p className="mt-6 text-xs text-mist-500">
          © {new Date().getFullYear()} {siteConfig.name}. Prototype interface —
          personas are illustrative examples and do not provide professional
          advice.
        </p>
      </div>
    </footer>
  );
}
