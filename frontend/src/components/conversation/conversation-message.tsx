"use client";

import { cn } from "@/lib/utils";
import type { ConversationMessage } from "@/types/persona";

/** Single transcript bubble, aligned by speaker. */
export function ConversationMessageItem({
  message,
  personaName,
  personaInitials,
  personaAccent,
}: {
  message: ConversationMessage;
  personaName: string;
  personaInitials: string;
  personaAccent: [string, string];
}) {
  const isUser = message.speaker === "user";

  return (
    <li
      className={cn(
        "flex animate-fade-up items-end gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser ? (
        <span
          aria-hidden
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[10px] font-semibold text-white"
          style={{
            background: `linear-gradient(145deg, ${personaAccent[0]}, ${personaAccent[1]})`,
          }}
        >
          {personaInitials}
        </span>
      ) : null}

      <div className={cn("max-w-[85%] sm:max-w-[75%]", isUser && "text-right")}>
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.12em] text-mist-500",
            !isUser && "mb-1.5",
          )}
        >
          {isUser ? "You" : personaName}
        </p>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-left text-sm leading-relaxed",
            isUser
              ? "bg-white/8 text-mist-100"
              : "glass text-mist-200",
          )}
        >
          {message.text}
        </div>
        <time className="mt-1.5 block text-[10px] text-mist-500">
          {message.timestamp}
        </time>
      </div>
    </li>
  );
}
