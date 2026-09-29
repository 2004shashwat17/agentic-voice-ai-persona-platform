import type {
  ConversationMessage,
  Persona,
  PersonaLibraryEntry,
} from "@/types/persona";

/**
 * MOCK DATA — intentionally in-memory and clearly labelled as such.
 * This will be replaced by a real API/data layer in a later step.
 */

const DISCLAIMER =
  "AI-generated responses are for informational purposes and should not replace professional advice.";

export const personas: Persona[] = [
  {
    id: "doctor",
    name: "Doctor AI",
    tagline: "Calm, professional and empathetic.",
    description:
      "A composed medical persona that explains concepts clearly, asks the right follow-up questions, and keeps you comfortable while you talk through what is on your mind.",
    category: "Health",
    avatar: "/avatars/doctor.svg",
    initials: "DA",
    accent: ["#38bdf8", "#0ea5e9"],
    personality: ["Professional", "Empathetic", "Analytical"],
    voice: { name: "Calm", style: "Calm / professional" },
    knowledge: {
      summary: "Medical knowledge base",
      sourceCount: 128,
      status: "ready",
    },
    capabilities: [
      "Voice conversation",
      "Knowledge retrieval",
      "Conversation memory",
    ],
    disclaimer: DISCLAIMER,
    featured: true,
    lastConversationAt: "2024-05-14T09:12:00.000Z",
  },
  {
    id: "actor",
    name: "Actor AI",
    tagline: "Expressive, character-driven and conversational.",
    description:
      "A theatrical persona that stays in character, improvises scenes, and shifts tone on command — from intimate monologue to sharp comedic timing.",
    category: "Creative",
    avatar: "/avatars/actor.svg",
    initials: "AA",
    accent: ["#c4b5fd", "#a78bfa"],
    personality: ["Expressive", "Energetic", "Humorous"],
    voice: { name: "Expressive", style: "Expressive / theatrical" },
    knowledge: {
      summary: "Scripts, character notes and improv references",
      sourceCount: 74,
      status: "ready",
    },
    capabilities: [
      "Voice conversation",
      "Character role-play",
      "Tone and emotion control",
      "Conversation memory",
    ],
    featured: true,
    lastConversationAt: "2024-05-13T18:40:00.000Z",
  },
  {
    id: "teacher",
    name: "Teacher AI",
    tagline: "Patient, explanatory and educational.",
    description:
      "A patient tutor that meets you at your level, breaks hard ideas into small steps, and checks understanding before moving on.",
    category: "Education",
    avatar: "/avatars/teacher.svg",
    initials: "TA",
    accent: ["#34d399", "#10b981"],
    personality: ["Patient", "Friendly", "Explanatory"],
    voice: { name: "Warm", style: "Warm / encouraging" },
    knowledge: {
      summary: "Curriculum, textbooks and worked examples",
      sourceCount: 212,
      status: "ready",
    },
    capabilities: [
      "Voice conversation",
      "Knowledge retrieval",
      "Lesson pacing",
      "Conversation memory",
    ],
    featured: true,
    lastConversationAt: "2024-05-12T07:05:00.000Z",
  },
  {
    id: "business",
    name: "Business AI",
    tagline: "Analytical, strategic and professional.",
    description:
      "A strategic advisor that frames problems clearly, weighs trade-offs out loud, and helps you turn an ambiguous idea into a plan.",
    category: "Business",
    avatar: "/avatars/business.svg",
    initials: "BA",
    accent: ["#fbbf24", "#f59e0b"],
    personality: ["Professional", "Analytical", "Decisive"],
    voice: { name: "Professional", style: "Professional / measured" },
    knowledge: {
      summary: "Strategy frameworks, case studies and market data",
      sourceCount: 96,
      status: "ready",
    },
    capabilities: [
      "Voice conversation",
      "Knowledge retrieval",
      "Structured reasoning",
      "Conversation memory",
    ],
    featured: true,
  },
  {
    id: "coach",
    name: "Coach AI",
    tagline: "Supportive, direct and motivating.",
    description:
      "A motivational coach that listens first, then gives you one or two concrete actions instead of a wall of advice.",
    category: "Wellness",

    avatar: "/avatars/coach.svg",
    initials: "CA",
    accent: ["#fb7185", "#f43f5e"],
    personality: ["Energetic", "Empathetic", "Direct"],
    voice: { name: "Energetic", style: "Energetic / motivating" },
    knowledge: {
      summary: "Coaching frameworks, habits and accountability plans",
      sourceCount: 58,
      status: "ready",
    },
    capabilities: [
      "Voice conversation",
      "Goal tracking",
      "Accountability check-ins",
      "Conversation memory",
    ],
    lastConversationAt: "2024-05-10T20:22:00.000Z",
  },
  {
    id: "research",
    name: "Research AI",
    tagline: "Rigorous, curious and precise.",
    description:
      "A research companion that states assumptions, asks for the missing citation, and separates what is known from what is inferred.",
    category: "Research",
    avatar: "/avatars/research.svg",
    initials: "RA",
    accent: ["#22d3ee", "#06b6d4"],
    personality: ["Analytical", "Precise", "Curious"],
    voice: { name: "Deep", style: "Deep / measured" },
    knowledge: {
      summary: "Papers, datasets and methodology notes",
      sourceCount: 341,
      status: "processing",
    },
    capabilities: [
      "Voice conversation",
      "Knowledge retrieval",
      "Citation recall",
      "Conversation memory",
    ],
    disclaimer: DISCLAIMER,
  },
];


export const personaCategories = [
  "All",
  "Health",
  "Creative",
  "Education",
  "Business",
  "Wellness",
  "Research",
] as const;

export function getPersonaById(id: string) {
  return personas.find((persona) => persona.id === id);
}

export function getFeaturedPersonas() {
  return personas.filter((persona) => persona.featured);
}

/* -------------------------------------------------------------------------- */
/* Library (My Personas)                                                      */
/* -------------------------------------------------------------------------- */

/** MOCK: which personas the user owns, recently used, or favourited. */
export const personaLibrary: PersonaLibraryEntry[] = [
  {
    personaId: "doctor",
    lastConversationAt: "2024-05-14T09:12:00.000Z",
    durationSeconds: 512,
    favorite: true,
  },
  {
    personaId: "teacher",
    lastConversationAt: "2024-05-12T07:05:00.000Z",
    durationSeconds: 268,
    favorite: false,
  },
  {
    personaId: "coach",
    lastConversationAt: "2024-05-10T20:22:00.000Z",
    durationSeconds: 934,
    favorite: true,
  },
  {
    personaId: "actor",
    lastConversationAt: "2024-05-13T18:40:00.000Z",
    durationSeconds: 143,
    favorite: false,
  },
  {
    personaId: "business",
    lastConversationAt: null,
    durationSeconds: 0,
    favorite: false,
  },
];

/* -------------------------------------------------------------------------- */
/* Custom persona (owned by the user, shown alongside the built-ins)          */
/* -------------------------------------------------------------------------- */

export const customPersona: Persona = {
  id: "study-companion",
  name: "Study Companion",
  tagline: "Focused, encouraging and structured.",
  description:
    "A persona I tuned for revision sessions — short blocks, active recall prompts and a steady, encouraging voice.",
  category: "Education",
  avatar: "/avatars/custom.svg",
  initials: "SC",
  accent: ["#818cf8", "#6366f1"],
  personality: ["Patient", "Friendly", "Calm"],
  voice: { name: "Calm", style: "Calm / steady" },
  knowledge: {
    summary: "My lecture notes and past papers",
    sourceCount: 6,
    status: "ready",
  },
  capabilities: [
    "Voice conversation",
    "Knowledge retrieval",
    "Active recall prompts",
    "Conversation memory",
  ],
  isCustom: true,
  lastConversationAt: "2024-05-11T16:48:00.000Z",
};

/* -------------------------------------------------------------------------- */
/* Simulated transcripts                                                      */
/* -------------------------------------------------------------------------- */

const genericScript: ConversationMessage[] = [
  { id: "m1", speaker: "user", text: "What should I focus on today?", timestamp: "10:12" },
  {
    id: "m2",
    speaker: "persona",
    text: "Let's start by understanding what you're trying to accomplish. What's the one outcome that would make today feel successful?",
    timestamp: "10:12",
  },
  { id: "m3", speaker: "user", text: "Finishing the draft and getting it reviewed.", timestamp: "10:13" },
  {
    id: "m4",
    speaker: "persona",
    text: "Good — that's specific. If we split it, which part is the riskiest: the structure, or the parts you're less confident about?",
    timestamp: "10:13",
  },
];

export const actorScript: ConversationMessage[] = [
  {
    id: "a1",
    speaker: "persona",
    text: "The stage is empty. Give me a setting, an age, a temperature — I'll be there in three seconds.",
    timestamp: "18:40",
  },
  { id: "a2", speaker: "user", text: "A detective alone in a train station at 3am.", timestamp: "18:40" },
  {
    id: "a3",
    speaker: "persona",
    text: "(to the empty platform) Of course you're still here. Nobody leaves a station at three in the morning unless they're waiting for something worse to arrive.",
    timestamp: "18:41",
  },
];

/** MOCK: canned replies cycled through by the simulated voice state machine. */
export const simulatedReplies = [
  "Let's start by understanding what you're trying to accomplish. What's the outcome that matters most to you right now?",
  "That's a useful place to begin. Tell me a little more and I'll help you break it into something you can act on today.",
  "I want to make sure I'm following you. Would you rather go deeper on that, or step back and look at the bigger picture?",
  "Good. Based on what you've said, here's what I'd focus on first — and one small step to keep momentum.",
];

/** MOCK: canned user utterances appended as the simulated session progresses. */
export const simulatedUserLines = [
  "I'm not sure where to start honestly.",
  "Right, that makes sense. Keep me focused on one thing.",
];

/** Return a deterministic script per persona id for the prototype. */
export function getMockTranscript(personaId: string): ConversationMessage[] {
  return personaId === "actor" ? actorScript : genericScript;
}

