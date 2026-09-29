import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PersonaProfile } from "@/components/personas/persona-profile";
import { ApiError } from "@/lib/api/client";
import { toUiPersona, toUiPersonas } from "@/lib/api/adapters";
import { getPersona, listPersonas } from "@/lib/api/personas";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const persona = await getPersona(id);
    return { title: persona.name, description: persona.description };
  } catch {
    return { title: "Persona not found" };
  }
}

export default async function PersonaProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let persona;
  try {
    persona = await getPersona(id);
  } catch (error) {
    // A missing persona is a 404; an unreachable API is a 500 we surface.
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const current = toUiPersona(persona);

  // Same-category personas first, then anything else, capped at three.
  const { items } = await listPersonas({ activeOnly: true, limit: 100 });
  const others = items.filter((item) => item.id !== persona.id);
  const related = toUiPersonas(
    [
      ...others.filter((item) => item.category === persona.category),
      ...others.filter((item) => item.category !== persona.category),
    ].slice(0, 3),
  );

  return <PersonaProfile persona={current} related={related} />;
}
