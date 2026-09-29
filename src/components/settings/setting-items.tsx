"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */

export function SettingGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-3xl p-7">
      <h2 className="text-[15px] font-medium text-white">{title}</h2>
      {description ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-mist-500">
          {description}
        </p>
      ) : null}
      <div className="mt-6 divide-y divide-white/6">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export function SettingRow({
  label,
  hint,
  control,
}: {
  label: string;
  hint?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm text-mist-200">{label}</p>
        {hint ? <p className="mt-1 text-[12px] text-mist-500">{hint}</p> : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Controlled switch row — local state only in this prototype. */
export function ToggleRow({
  label,
  hint,
  defaultChecked = false,
}: {
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <SettingRow
      label={label}
      hint={hint}
      control={
        <Switch defaultChecked={defaultChecked} aria-label={label} />
      }
    />
  );
}

/* -------------------------------------------------------------------------- */

export function ChoiceRow<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <SettingRow
      label={label}
      hint={hint}
      control={
        <div
          role="radiogroup"
          aria-label={label}
          className="flex gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={value === option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[13px] transition-all duration-300",
                value === option.value
                  ? "bg-white/12 text-white"
                  : "text-mist-400 hover:text-white",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */

export function TextRow({
  label,
  hint,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <SettingRow
      label={label}
      hint={hint}
      control={
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          aria-label={label}
          onChange={(event) => onChange(event.target.value)}
          className="w-56 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-mist-100 outline-none transition-all focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
        />
      }
    />
  );
}
