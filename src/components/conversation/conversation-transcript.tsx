"use client";

import { useEffect, useRef } from "react";
import { MessagesSquare } from "lucide-react";

import { ConversationMessageItem } from "@/components/conversation/conversation-message";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConversationMessage } from "@/types/persona";

type ConversationTranscriptProps = {
  messages: ConversationMessage[];
  personaName: string;
  personaInitials: string;
  personaAccent: [string, string];
  /** Collapsed mode is used on mobile where vertical space is limited. */
  collapsible?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
};

/** Scrollable transcript with empty, populated and collapsible states. */
export function ConversationTranscript({
  messages,
  personaName,
  personaInitials,
  personaAccent,
  collapsible = false,
  isOpen,
  onOpenChange,
  className,
}: ConversationTranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const header = (
    <div className="flex items-center justify-between gap-4 border-b border-white/6 px-5 py-4">
      <h2 className="flex items-center gap-2 text-sm font-medium text-white">
        <MessagesSquare className="h-4 w-4 text-mist-400" />
        Transcript
      </h2>
      <span className="text-[11px] text-mist-500">
        {messages.length} message{messages.length === 1 ? "" : "s"}
      </span>
    </div>
  );

  const body = (
    <div className="max-h-[26rem] overflow-y-auto px-5 py-5">
      {messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-mist-500">
          Nothing said yet. Tap the microphone to begin.
        </p>
      ) : (
        <ul className="space-y-5">
          {messages.map((message) => (
            <ConversationMessageItem
              key={message.id}
              message={message}
              personaName={personaName}
              personaInitials={personaInitials}
              personaAccent={personaAccent}
            />
          ))}
          <div ref={endRef} />
        </ul>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <div className={cn("glass overflow-hidden rounded-3xl", className)}>
        {header}
        <div
          className="grid transition-[grid-template-rows] duration-500"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">{body}</div>
        </div>
        {!isOpen ? (
          <div className="px-5 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(true)}
              className="w-full"
            >
              Show transcript
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className={cn("glass overflow-hidden rounded-3xl", className)}>
      {header}
      {body}
    </section>
  );
}
