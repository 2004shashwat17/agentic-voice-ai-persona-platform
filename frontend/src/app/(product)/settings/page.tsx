import type { Metadata } from "next";

import { SettingsPanel } from "@/components/settings/settings-panel";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account, appearance, voice, conversation and privacy preferences.",
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
