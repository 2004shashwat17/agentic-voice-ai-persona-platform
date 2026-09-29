import * as React from "react";
import { cn } from "@/lib/utils";

/** Pill used for categories, traits and voice labels. */
export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "brand" | "success" | "warning" | "muted";
}) {
  const tones = {
    default: "bg-white/8 text-mist-200 border-white/10",
    brand: "bg-brand-500/12 text-brand-400 border-brand-500/25",
    success: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
    warning: "bg-amber-500/12 text-amber-300 border-amber-500/25",
    muted: "bg-white/4 text-mist-400 border-white/6",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Section eyebrow, e.g. "HOW IT WORKS". */
export function Eyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400/80",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:leading-[1.15]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-[15px] leading-relaxed text-mist-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Consistent vertical rhythm for landing page sections. */
export function Section({
  className,
  children,
  id,
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section id={id} className={cn("px-5 py-20 sm:px-8 md:py-28", className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
