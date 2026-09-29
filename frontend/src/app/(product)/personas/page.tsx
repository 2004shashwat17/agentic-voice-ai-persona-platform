import type { Metadata } from "next";
import Link from "next/link";

import { PersonaExplorer } from "@/components/personas/persona-explorer";
import { Button } from "@/components/ui/button";
import { toUiPersonas } from "@/lib/api/adapters";
import { listPersonas } from "@/lib/api/personas";

export const metadata: Metadata = {
  title: "Personas",
  description: "Browse AI voice personas by role, trait and voice character.",
};

// Personas are owned by the backend, so this page is always rendered live.
export const dynamic = "force-dynamic";

export default async function PersonasPage() {
  try {
    const { items } = await listPersonas({ activeOnly: true, limit: 100 });
    return <PersonaExplorer personas={toUiPersonas(items)} />;
  } catch {
    return <PersonasUnavailable />;
  }
}

function PersonasUnavailable() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Couldn&apos;t reach the PersonaAI API
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-mist-400">
        Start the backend with{" "}
        <code className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-sm text-brand-400">
          uvicorn app.main:app --reload
        </code>{" "}
        in the <code className="font-mono text-sm">backend</code> folder, then
        try again.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/personas">Try again</Link>
      </Button>
    </div>
  );
}
