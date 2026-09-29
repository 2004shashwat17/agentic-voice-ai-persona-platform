import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-mist-100 placeholder:text-mist-500 outline-none transition-all duration-300 focus:border-brand-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, "min-h-24 resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-2 block text-[13px] font-medium text-mist-300",
        className,
      )}
      {...props}
    />
  );
}

/** Native select styled to match the dark field system. */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(fieldBase, "cursor-pointer pr-10", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";
