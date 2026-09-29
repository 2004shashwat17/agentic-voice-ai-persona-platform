import type { Metadata } from "next";

import { CreatePersonaWizard } from "@/components/personas/create-persona-wizard";

export const metadata: Metadata = {
  title: "Create Persona",
  description:
    "Build a persona with its own personality, knowledge base and voice.",
};

export default function CreatePersonaPage() {
  return <CreatePersonaWizard />;
}
