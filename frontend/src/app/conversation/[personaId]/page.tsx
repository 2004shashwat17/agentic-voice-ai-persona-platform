import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConversationView } from "@/components/conversation/conversation-view";
import { ApiError } from "@/lib/api/client";
import { toUiPersona } from "@/lib/api/adapters";
import { getPersona } from "@/lib/api/personas";
import { getMockTranscript } from "@/data/personas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conversation",
  description: "A simulated real-time voice conversation with a persona.",
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ personaId: string }>;
}) {
  const { personaId } = await params;

  try {
    const persona = await getPersona(personaId);
    return (
      <ConversationView
        persona={toUiPersona(persona)}
        initialMessages={getMockTranscript(personaId)}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

