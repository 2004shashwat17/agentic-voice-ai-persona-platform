"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { simulatedReplies, simulatedUserLines } from "@/data/personas";
import type { ConversationMessage, VoiceState } from "@/types/persona";

/** Status copy shown beneath the orb, mapped from the simulated state. */
export const VOICE_STATUS: Record<VoiceState, { title: string; hint: string }> = {
  idle: { title: "Ready to talk", hint: "Tap the microphone when you're ready" },
  listening: { title: "Listening...", hint: "Speak naturally — I'm following along" },
  processing: { title: "Thinking...", hint: "Putting your words together" },
  speaking: { title: "Speaking...", hint: "Go ahead and listen" },
  error: { title: "Something went wrong", hint: "Tap the microphone to try again" },
  muted: { title: "Microphone muted", hint: "Tap to unmute when you're ready" },
  ended: { title: "Conversation ended", hint: "Start again whenever you like" },
};

/** Simulated stage durations (ms). Real timing comes from the audio pipeline. */
const TIMING = {
  listening: 2600,
  processing: 1400,
  speaking: 3200,
} as const;

let replyCursor = 0;
let userCursor = 0;

function nowLabel() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Frontend-only simulation of a voice session.
 *
 * Drives idle → listening → processing → speaking → idle and appends mock
 * transcript lines. No microphone, TTS or model calls are involved.
 */
export function useVoiceSession(initialMessages: ConversationMessage[]) {
  const [state, setState] = useState<VoiceState>("idle");
  const [messages, setMessages] = useState<ConversationMessage[]>(
    initialMessages,
  );
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    timers.current.push(setTimeout(fn, delay));
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Session timer only runs while the conversation is active.
  useEffect(() => {
    if (state === "ended") return;
    const id = setInterval(
      () => setSessionSeconds((value) => value + 1),
      1000,
    );
    return () => clearInterval(id);
  }, [state === "ended"]); // eslint-disable-line react-hooks/exhaustive-deps

  const appendMessage = useCallback(
    (speaker: ConversationMessage["speaker"], text: string) => {
      setMessages((current) => [
        ...current,
        {
          id: `${speaker}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          speaker,
          text,
          timestamp: nowLabel(),
        },
      ]);
    },
    [],
  );

  const speak = useCallback(() => {
    setState("speaking");
    const reply = simulatedReplies[replyCursor % simulatedReplies.length];
    replyCursor += 1;
    schedule(() => {
      appendMessage("persona", reply);
      setState("idle");
    }, TIMING.speaking);
  }, [appendMessage, schedule]);

  const startListening = useCallback(() => {
    clearTimers();
    setState("listening");
    schedule(() => {
      setState("processing");
      schedule(() => {
        const line = simulatedUserLines[userCursor % simulatedUserLines.length];
        userCursor += 1;
        appendMessage("user", line);
        speak();
      }, TIMING.processing);
    }, TIMING.listening);
  }, [appendMessage, clearTimers, schedule, speak]);

  const toggleMicrophone = useCallback(() => {
    if (state === "ended") {
      // Restart a fresh session from the seeded transcript.
      clearTimers();
      setSessionSeconds(0);
      setIsMuted(false);
      setState("idle");
      startListening();
      return;
    }

    if (isMuted) {
      setIsMuted(false);
      setState("idle");
      return;
    }

    if (state === "listening") {
      clearTimers();
      setState("idle");
      return;
    }

    if (state === "processing" || state === "speaking") {
      clearTimers();
      setState("idle");
      return;
    }

    startListening();
  }, [clearTimers, isMuted, startListening, state]);

  const toggleMute = useCallback(() => {
    setIsMuted((muted) => {
      const next = !muted;
      if (next) {
        clearTimers();
        setState("muted");
      } else {
        setState("idle");
      }
      return next;
    });
  }, [clearTimers]);

  const endConversation = useCallback(() => {
    clearTimers();
    setState("ended");
  }, [clearTimers]);

  /** Prototype-only affordance for demonstrating the error state. */
  const simulateError = useCallback(() => {
    clearTimers();
    setState("error");
  }, [clearTimers]);

  return {
    state,
    messages,
    sessionSeconds,
    isMuted,
    status: VOICE_STATUS[state],
    toggleMicrophone,
    toggleMute,
    endConversation,
    simulateError,
  };
}
