// SPDX-License-Identifier: Apache-2.0
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

export const Button = ({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) => (
  <button
    {...props}
    style={{ transitionProperty: "background-color, border-color, color, transform" }}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium border transition-colors select-none",
      "active:scale-[0.96]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
      "disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100",
      size === "sm" && "px-3 py-1.5 text-[12px] min-h-[34px]",
      size === "md" && "px-4 py-2.5 text-[13px] min-h-[40px]",
      variant === "primary" &&
        "border-ink-50/0 bg-ink-50 text-ink-950 hover:bg-white",
      variant === "secondary" &&
        "border-ink-700/70 bg-ink-900/40 text-ink-100 hover:bg-ink-800/60 hover:text-ink-50 hover:border-ink-600",
      variant === "ghost" &&
        "border-transparent bg-transparent text-ink-300 hover:text-ink-100 hover:bg-ink-800/40",
      className,
    )}
  >
    {children}
  </button>
);
