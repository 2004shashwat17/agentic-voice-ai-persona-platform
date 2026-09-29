import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConversationView } from "@/components/conversation/conversation-view";
import { customPersona, getMockTranscript, personas } from "@/data/personas";

export const metadata: Metadata = {
  title: "Conversation",
  description: "A simulated real-time voice conversation with a persona.",
};

export function generateStaticParams() {
  return [...personas, customPersona].map((persona) => ({
    personaId: persona.id,
  }));
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ personaId: string }>;
}) {
  const { personaId } = await params;
  const persona = [...personas, customPersona].find(
    (item) => item.id === personaId,
  );

  if (!persona) notFound();

  return (
    <ConversationView
      persona={persona}
      initialMessages={getMockTranscript(persona.id)}
    />
  );
}
