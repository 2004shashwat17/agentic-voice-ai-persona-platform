import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Data-driven safety notice. Personas that declare a `disclaimer` render this
 * on their profile and conversation views — no hardcoding per persona.
 */
export function Disclaimer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
      <p className="text-[13px] leading-relaxed text-amber-100/80">
        {children}
      </p>
    </aside>
  );
}
