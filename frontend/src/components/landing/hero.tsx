import Link from "next/link";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PersonaAvatar } from "@/components/personas/persona-avatar";
import { Eyebrow } from "@/components/ui/primitives";
import { siteConfig } from "@/config/site";
import { getFeaturedPersonas } from "@/data/personas";

/** Hero. Floating persona cluster stands in for live voice sessions. */
export function Hero() {
  const featured = getFeaturedPersonas();

  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        <div className="animate-fade-up">
          <Eyebrow>AI voice personas</Eyebrow>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            <span className="text-gradient">Talk to AI that feels</span>
            <br />
            different.
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-relaxed text-mist-300">
            {siteConfig.description}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/personas">
                Explore Personas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/personas/create">
                <Wand2 className="h-4 w-4" />
                Create Your Persona
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-mist-500">
            Prototype interface — voices and conversations are simulated.
          </p>
        </div>

        {/* Persona cluster */}
        <div
          className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4"
          aria-hidden
        >
          <div
            className="absolute inset-x-8 top-10 bottom-0 -z-10 animate-orb-breathe rounded-[40px] blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(56,189,248,0.28), transparent 68%)",
            }}
          />
          {featured.slice(0, 4).map((persona, index) => (
            <Link
              key={persona.id}
              href={`/personas/${persona.id}`}
              tabIndex={-1}
              className="group glass animate-float rounded-3xl p-5 transition-colors duration-500 hover:border-white/20"
              style={{ animationDelay: `${index * 0.9}s` }}
            >
              <PersonaAvatar
                initials={persona.initials}
                accent={persona.accent}
                size="lg"
              />
              <p className="mt-4 text-sm font-medium text-white">
                {persona.name}
              </p>
              <p className="mt-1 text-xs text-mist-500">
                {persona.voice.name} voice
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-brand-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                listening
              </div>
            </Link>
          ))}

          <div className="glass col-span-2 flex items-center gap-3 rounded-3xl p-5">
            <Sparkles className="h-4 w-4 shrink-0 text-accent-400" />
            <p className="text-xs leading-relaxed text-mist-400">
              Each persona carries its own personality, knowledge base and
              voice — the conversation changes completely.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
