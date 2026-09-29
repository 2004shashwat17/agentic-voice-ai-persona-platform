"use client";

import { useState } from "react";

import {
  ChoiceRow,
  SettingGroup,
  TextRow,
  ToggleRow,
} from "@/components/settings/setting-items";
import { Section, SectionHeading } from "@/components/ui/primitives";

type Theme = "dark" | "system" | "light";
type Quality = "standard" | "high";

/**
 * Settings surface. All controls are local React state in the prototype —
 * nothing is persisted or sent to a server.
 */
export function SettingsPanel() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [quality, setQuality] = useState<Quality>("high");
  const [voice, setVoice] = useState("Doctor AI");
  const [name, setName] = useState("Alex Morgan");

  return (
    <Section>
      <SectionHeading
        align="left"
        eyebrow="Preferences"
        title="Settings"
        description="Tune how PersonaAI looks and behaves. Changes here stay in your browser for this prototype."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <SettingGroup title="Account" description="Prototype profile fields.">
          <TextRow
            label="Display name"
            value={name}
            onChange={setName}
            placeholder="Your name"
          />
          <TextRow
            label="Email"
            value="alex@example.com"
            onChange={() => undefined}
            type="email"
          />
          <TextRow
            label="Plan"
            value="Prototype"
            onChange={() => undefined}
          />
        </SettingGroup>

        <SettingGroup title="Appearance" description="Interface preferences.">
          <ChoiceRow
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
            ]}
          />
          <ToggleRow
            label="Reduce motion"
            hint="Minimise animation across the app."
            defaultChecked={false}
          />
          <ToggleRow
            label="Show transcripts inline"
            hint="Display the transcript on the conversation screen."
            defaultChecked
          />
        </SettingGroup>

        <SettingGroup title="Voice" description="Default vocal behaviour.">
          <ChoiceRow
            label="Preferred persona"
            value={voice}
            onChange={setVoice}
            options={[
              { value: "Doctor AI", label: "Doctor" },
              { value: "Actor AI", label: "Actor" },
              { value: "Teacher AI", label: "Teacher" },
            ]}
          />
          <ChoiceRow
            label="Response quality"
            value={quality}
            onChange={setQuality}
            options={[
              { value: "standard", label: "Standard" },
              { value: "high", label: "High" },
            ]}
          />
          <ToggleRow
            label="Auto-play responses"
            hint="Start speaking as soon as a reply is ready."
            defaultChecked
          />
        </SettingGroup>

        <SettingGroup
          title="Conversation"
          description="How sessions behave while you talk."
        >
          <ToggleRow
            label="Barge-in"
            hint="Interrupt a persona mid-sentence."
            defaultChecked
          />
          <ToggleRow
            label="Save transcripts"
            hint="Keep a history of past conversations."
            defaultChecked
          />
          <TextRow
            label="Session limit"
            value="30 min"
            onChange={() => undefined}
          />
        </SettingGroup>

        <SettingGroup
          title="Privacy"
          description="Control what is retained or shared."
        >
          <ToggleRow
            label="Store conversation memory"
            hint="Let personas recall earlier sessions."
            defaultChecked
          />
          <ToggleRow
            label="Share anonymous usage data"
            hint="Help improve the product."
            defaultChecked={false}
          />
          <TextRow
            label="Clear history"
            value=""
            placeholder="Delete all data"
            onChange={() => undefined}
          />
        </SettingGroup>

        <SettingGroup
          title="Notifications"
          description="What the app tells you about."
        >
          <ToggleRow
            label="Session reminders"
            hint="Nudge you to start a conversation."
            defaultChecked={false}
          />
          <ToggleRow
            label="Persona updates"
            hint="When a persona's knowledge finishes processing."
            defaultChecked
          />
          <ToggleRow
            label="Product news"
            hint="Occasional updates from the team."
            defaultChecked={false}
          />
        </SettingGroup>
      </div>
    </Section>
  );
}
