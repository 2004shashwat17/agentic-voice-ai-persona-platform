import type { Metadata } from "next";

import { PersonaExplorer } from "@/components/personas/persona-explorer";

export const metadata: Metadata = {
  title: "Personas",
  description:
    "Browse AI voice personas by role, trait and voice character.",
};

export default function PersonasPage() {
  return <PersonaExplorer />;
}
