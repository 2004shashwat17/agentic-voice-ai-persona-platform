"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Mic2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { navLinks, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-[0_6px_20px_-6px_rgba(56,189,248,0.8)]">
        <Mic2 className="h-4 w-4 text-ink-950" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white">
        {siteConfig.name}
      </span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Responsive site navigation — one markup tree, mobile collapses to a sheet. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Wordmark />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors",
                isActive(pathname, link.href)
                  ? "bg-white/8 text-white"
                  : "text-mist-400 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link href="/personas/create">Create Persona</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="rounded-xl border border-white/10 p-2 text-mist-200 transition-colors hover:bg-white/8 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav
          aria-label="Mobile"
          className="border-t border-white/6 px-5 py-4 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm transition-colors",
                  isActive(pathname, link.href)
                    ? "bg-white/8 text-white"
                    : "text-mist-300 hover:bg-white/5 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="mt-3 w-full" size="md">
              <Link href="/personas/create" onClick={() => setOpen(false)}>
                Create Persona
              </Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
