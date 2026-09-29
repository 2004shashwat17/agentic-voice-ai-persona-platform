import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Mic,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

import { PersonaCard } from "@/components/personas/persona-card";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { getFeaturedPersonas } from "@/data/personas";

export function FeaturedPersonas() {
  const featured = getFeaturedPersonas();

  return (
    <Section>
      <SectionHeading
        eyebrow="Featured personas"
        title="Four voices, four completely different conversations."
        description="Each persona is tuned with its own instructions, knowledge and vocal character — so the same question lands differently with each one."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {featured.map((persona) => (
          <PersonaCard key={persona.id} persona={persona} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/personas">
            Browse all personas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

const STEPS = [
  {
    icon: Sparkles,
    title: "Choose a persona",
    body: "Browse the library and pick the voice that fits the conversation you want to have.",
  },
  {
    icon: Brain,
    title: "Give it context",
    body: "Add your own knowledge so the persona talks about what actually matters to you.",
  },
  {
    icon: Mic,
    title: "Start talking",
    body: "Tap once and speak naturally. No typing, no message bubbles — just a voice that responds.",
  },
] as const;

export function HowItWorks() {
  return (
    <Section className="border-y border-white/6">
      <SectionHeading
        eyebrow="How it works"
        title="Choose who you want to talk to → enter their world → start talking."
      />

      <ol className="mt-14 grid gap-5 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="glass group relative overflow-hidden rounded-3xl p-7 transition-colors duration-500 hover:border-white/15"
          >
            <span className="absolute right-6 top-5 text-5xl font-semibold text-white/[0.04]">
              0{index + 1}
            </span>
            <step.icon className="h-5 w-5 text-brand-400" />
            <h3 className="mt-5 text-lg font-medium text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-mist-400">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const CAPABILITIES = [
  {
    icon: Brain,
    title: "Own knowledge base",
    body: "Load documents so a persona answers from your material, not generic replies.",
  },
  {
    icon: Mic,
    title: "Distinct voice character",
    body: "Every persona has a vocal identity — pace, tone and warmth tuned to its role.",
  },
  {
    icon: BookOpen,
    title: "Conversation memory",
    body: "Personas remember earlier in the session, so you never repeat yourself.",
  },
  {
    icon: ShieldCheck,
    title: "Configurable safety rules",
    body: "Specialised personas carry their own disclaimers, defined with the persona.",
  },
] as const;

export function Capabilities() {
  return (
    <Section>
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Capabilities"
            title="Built for conversations, not text boxes."
            description="The interface is designed around speaking and listening — the transcript is secondary, the conversation is the product."
          />
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((item) => (
            <li key={item.title} className="glass rounded-3xl p-6">
              <item.icon className="h-5 w-5 text-accent-400" />
              <h3 className="mt-4 text-[15px] font-medium text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-400">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function CustomPersonaCta() {
  return (
    <Section>
      <div className="glass relative overflow-hidden rounded-[32px] p-10 sm:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl"
        />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Custom persona"
              title="Build someone no one else has."
              description="Give your persona a name, a personality, a voice and a knowledge base. The wizard walks you through each one in a few minutes."
            />
            <Button asChild size="lg" className="mt-8">
              <Link href="/personas/create">
                <Wand2 className="h-4 w-4" />
                Create Your Persona
              </Link>
            </Button>
          </div>

          <ul className="space-y-3">
            {[
              "Name and description",
              "Personality traits",
              "Knowledge documents",
              "Voice style",
              "Review and publish",
            ].map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 text-sm text-mist-200"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500/15 text-[11px] font-semibold text-brand-400">
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

export function FinalCta() {
  return (
    <Section className="pb-28 pt-8">
      <div className="relative text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
        />
        <h2 className="relative text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Ready when you are.
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-mist-400">
          Pick a persona, press the microphone, and see what a voice-first
          conversation feels like.
        </p>
        <div className="relative mt-9 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/personas">
              Explore Personas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link href="/my-personas">My Personas</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
