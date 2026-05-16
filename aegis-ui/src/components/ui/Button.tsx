// SPDX-License-Identifier: Apache-2.0
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md";

export const Button = ({
  variant = "primary",
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
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium border transition-all duration-150 select-none",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      size === "sm" && "px-2.5 py-1.5 text-xs",
      size === "md" && "px-3.5 py-2 text-sm",
      variant === "primary" &&
        "border-accent-500/40 bg-accent-500/15 text-accent-300 hover:bg-accent-500/25 hover:border-accent-500/60",
      variant === "secondary" &&
        "border-ink-700 bg-ink-800/80 text-ink-200 hover:bg-ink-700/80 hover:text-ink-100",
      variant === "ghost" &&
        "border-transparent bg-transparent text-ink-300 hover:text-ink-100 hover:bg-ink-800/60",
      variant === "danger" &&
        "border-danger-500/40 bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 hover:border-danger-500/60",
      variant === "success" &&
        "border-shield-500/40 bg-shield-500/15 text-shield-300 hover:bg-shield-500/25 hover:border-shield-500/60",
      className,
    )}
  >
    {children}
  </button>
);
