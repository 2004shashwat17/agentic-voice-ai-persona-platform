import type { Metadata } from "next";

import { PersonaLibrary } from "@/components/personas/persona-library";
import { toUiPersonas } from "@/lib/api/adapters";
import { listPersonas } from "@/lib/api/personas";

export const metadata: Metadata = {
  title: "My Personas",
  description: "Your created, recent and favourite personas.",
};

export const dynamic = "force-dynamic";

export default async function MyPersonasPage() {
  const { items } = await listPersonas({ activeOnly: false, limit: 100 });

  return <PersonaLibrary personas={toUiPersonas(items)} />;
}

