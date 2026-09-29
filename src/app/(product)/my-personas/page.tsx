import type { Metadata } from "next";

import { PersonaLibrary } from "@/components/personas/persona-library";

export const metadata: Metadata = {
  title: "My Personas",
  description: "Your created, recent and favourite personas.",
};

export default function MyPersonasPage() {
  return <PersonaLibrary />;
}
