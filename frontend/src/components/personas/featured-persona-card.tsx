import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";

import { PersonaAvatar } from "@/components/personas/persona-avatar";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Persona } from "@/types/persona";

/** Large hero-style card used for the featured persona. */
export function FeaturedPersonaCard({
  persona,
  className,
}: {
  persona: Persona;
  className?: string;
}) {
  const [from, to] = persona.accent;

  return (
    <article
      className={cn(
        "group relative grid overflow-hidden rounded-[28px] border border-white/10 lg:grid-cols-[1.1fr_1fr]",
        className,
      )}
    >
      {/* Visual side */}
      <div
        className="relative grid min-h-64 place-items-center overflow-hidden lg:min-h-full"
        style={{
          background: `linear-gradient(150deg, ${from}26, ${to}14 55%, transparent)`,
        }}
      >
        <div
          aria-hidden
          className="absolute h-72 w-72 animate-orb-breathe rounded-full opacity-40 blur-3xl"
          style={{ background: `radial-gradient(circle, ${from}, transparent 70%)` }}
        />
        <div className="relative grid grid-cols-2 gap-4 p-8 sm:grid-cols-3">
          <PersonaAvatar
            initials={persona.initials}
            accent={persona.accent}
            size="xl"
            active
          />
          <div className="flex flex-col justify-center gap-3 opacity-70">
            <div
              className="h-16 w-16 animate-float rounded-2xl"
              style={{ background: `${to}44` }}
            />
            <div
              className="h-10 w-10 animate-float rounded-xl"
              style={{ background: `${from}33`, animationDelay: "1.2s" }}
            />
          </div>
        </div>
      </div>

      {/* Content side */}
      <div className="relative flex flex-col justify-center gap-5 p-8 sm:p-10">
        <div>
          <Badge tone="brand">Featured persona</Badge>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {persona.name}
          </h3>
          <p className="mt-2 text-[15px] text-mist-300">{persona.tagline}</p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {persona.personality.map((trait) => (
            <li key={trait}>
              <Badge>{trait}</Badge>
            </li>
          ))}
        </ul>

        <p className="text-sm leading-relaxed text-mist-400">
          {persona.description}
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/conversation/${persona.id}`}>
              <Mic className="h-4 w-4" />
              Start talking
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/personas/${persona.id}`}>
              View profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
