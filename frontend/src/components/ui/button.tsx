"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 shadow-[0_8px_30px_-8px_rgba(56,189,248,0.7)] hover:shadow-[0_12px_38px_-8px_rgba(56,189,248,0.9)] hover:brightness-110",
        glass:
          "glass text-mist-100 hover:bg-white/10 hover:border-white/15",
        outline:
          "border border-white/12 text-mist-200 hover:border-white/25 hover:text-white hover:bg-white/5",
        ghost: "text-mist-300 hover:text-white hover:bg-white/6",
        subtle: "bg-white/6 text-mist-200 hover:bg-white/10 hover:text-white",
        danger:
          "bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:bg-rose-500/25",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-6",
        lg: "h-13 px-8 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
