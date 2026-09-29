import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400/80">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-mist-400">
          The page you were looking for isn&apos;t part of PersonaAI.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/personas">Explore personas</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
