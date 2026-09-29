import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PersonaProfile } from "@/components/personas/persona-profile";
import { customPersona, personas } from "@/data/personas";

/** Built once for a static-friendly route; data is mock-only. */
export function generateStaticParams() {
  return [...personas, customPersona].map((persona) => ({ id: persona.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const persona = [...personas, customPersona].find((item) => item.id === id);
  if (!persona) return { title: "Persona not found" };
  return { title: persona.name, description: persona.tagline };
}

export default async function PersonaProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const all = [...personas, customPersona];
  const persona = all.find((item) => item.id === id);

  if (!persona) notFound();

  const related = all
    .filter((item) => item.id !== persona.id && item.category === persona.category)
    .concat(all.filter((item) => item.id !== persona.id && item.category !== persona.category))
    .slice(0, 3);

  return <PersonaProfile persona={persona} related={related} />;
}
