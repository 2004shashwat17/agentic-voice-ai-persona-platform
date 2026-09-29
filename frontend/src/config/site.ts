/**
 * Single source of truth for user-facing product naming.
 * Rename the platform by editing these values only.
 */
export const siteConfig = {
  name: "PersonaAI",
  tagline: "Talk to AI that feels different.",
  description:
    "Choose a persona, give it context, and have a natural conversation.",
  /** Placeholder until a real backend is connected. */
  stage: "UI prototype" as const,
} as const;

export const navLinks = [
  { href: "/personas", label: "Personas" },
  { href: "/my-personas", label: "My Personas" },
  { href: "/settings", label: "Settings" },
] as const;
