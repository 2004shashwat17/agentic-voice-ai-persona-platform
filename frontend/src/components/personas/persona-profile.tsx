"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Brain, Database, Mic, Mic2, Sparkles } from "lucide-react";

import { Disclaimer } from "@/components/personas/disclaimer";
import { PersonaAvatar } from "@/components/personas/persona-avatar";
import { PersonaCard } from "@/components/personas/persona-card";
import { Badge, Section, SectionHeading } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Persona } from "@/types/persona";

const knowledgeTone = {
  ready: "success",
  processing: "warning",
  empty: "muted",
} as const;

/** Full persona profile: identity, traits, knowledge, voice and capabilities. */
export function PersonaProfile({
  persona,
  related,
}: {
  persona: Persona;
  related: Persona[];
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const detailRows = [
    ["Personality", persona.personality.join(", ")],
    ["Knowledge", persona.knowledge.summary],
    ["Voice", persona.voice.style],
    ["Knowledge sources", `${persona.knowledge.sourceCount} loaded`],
  ];

  return (
    <>
      <Section className="pt-10">
        <Button asChild variant="ghost" size="sm" className="mb-8 -ml-4">
          <Link href="/personas">
            <ArrowLeft className="h-4 w-4" />
            All personas
          </Link>
        </Button>

        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div className="relative order-last grid place-items-center lg:order-first">
            <div
              aria-hidden
              className="absolute h-64 w-64 animate-orb-breathe rounded-full opacity-40 blur-3xl"
              style={{
                background: `radial-gradient(circle, ${persona.accent[0]}, transparent 70%)`,
              }}
            />
            <PersonaAvatar
              initials={persona.initials}
              accent={persona.accent}
              size="xl"
              active
              className="relative"
            />
          </div>

          <div>
            <Badge tone="brand">{persona.category}</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {persona.name}
            </h1>
            <p className="mt-3 text-lg text-mist-300">{persona.tagline}</p>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-mist-400">
              {persona.description}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/conversation/${persona.id}`}>
                  <Mic className="h-4 w-4" />
                  Start Conversation
                </Link>
              </Button>

              <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg">
                    View Persona Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>How {persona.name} works</DialogTitle>
                  <DialogDescription>
                    This prototype models the interface only. These are the
                    behaviours each persona is designed around.
                  </DialogDescription>
                  <dl className="mt-6 space-y-4">
                    {detailRows.map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                      >
                        <dt className="text-[11px] uppercase tracking-[0.14em] text-mist-500">
                          {label}
                        </dt>
                        <dd className="mt-1.5 text-sm text-mist-200">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </DialogContent>
              </Dialog>
            </div>

            {persona.disclaimer ? (
              <Disclaimer className="mt-8 max-w-xl">
                {persona.disclaimer}
              </Disclaimer>
            ) : null}
          </div>
        </div>
      </Section>
      <Attributes persona={persona} />
      {related.length > 0 ? <Related personas={related} /> : null}
    </>
  );
}


function AttributeCard({
  icon,
  title,
  items,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  footer?: React.ReactNode;
}) {
  return (
    <Card className="p-7">
      <div className="flex items-center gap-3 text-brand-400">
        {icon}
        <h2 className="text-[15px] font-medium text-white">{title}</h2>
      </div>
      <ul className="mt-5 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-mist-300">{item}</li>
        ))}
      </ul>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </Card>
  );
}

function Attributes({ persona }: { persona: Persona }) {
  return (
    <Section className="pt-0">
      <div className="grid gap-5 md:grid-cols-3">
        <AttributeCard
          icon={<Sparkles className="h-4 w-4" />}
          title="Personality"
          items={persona.personality}
        />
        <AttributeCard
          icon={<Brain className="h-4 w-4" />}
          title="Knowledge"
          items={[persona.knowledge.summary]}
          footer={
            <Badge tone={knowledgeTone[persona.knowledge.status]}>
              {persona.knowledge.status} · {persona.knowledge.sourceCount} sources
            </Badge>
          }
        />
        <AttributeCard
          icon={<Mic2 className="h-4 w-4" />}
          title="Voice"
          items={[persona.voice.style]}
          footer={<Badge tone="muted">{persona.voice.name}</Badge>}
        />
      </div>

      <Card className="mt-5 p-7">
        <div className="flex items-center gap-3">
          <Database className="h-4 w-4 text-accent-400" />
          <h2 className="text-[15px] font-medium text-white">Capabilities</h2>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {persona.capabilities.map((capability) => (
            <li
              key={capability}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-mist-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {capability}
            </li>
          ))}
        </ul>
      </Card>
    </Section>
  );
}

function Related({ personas: related }: { personas: Persona[] }) {
  return (
    <Section className="pt-0">
      <SectionHeading
        align="left"
        eyebrow="You might also like"
        title="Other personas to explore."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => (
          <PersonaCard key={item.id} persona={item} />
        ))}
      </div>
    </Section>
  );
}
