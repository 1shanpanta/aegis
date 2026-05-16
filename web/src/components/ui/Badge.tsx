// SPDX-License-Identifier: Apache-2.0
import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

type Tone = "neutral" | "active" | "muted";

export const Badge = ({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] border whitespace-nowrap",
      tone === "neutral" && "border-ink-700/70 text-ink-400 bg-transparent",
      tone === "active" && "border-accent-500/40 text-accent-300 bg-accent-500/[0.06]",
      tone === "muted" && "border-ink-800 text-ink-500 bg-transparent",
      className,
    )}
  >
    {children}
  </span>
);

export const Dot = ({ tone = "neutral" }: { tone?: "neutral" | "active" | "muted" }) => (
  <span
    className={cn(
      "inline-block w-1.5 h-1.5 rounded-full",
      tone === "neutral" && "bg-ink-500",
      tone === "active" && "bg-accent-400 shadow-[0_0_0_3px_rgba(96,165,250,0.15)]",
      tone === "muted" && "bg-ink-700",
    )}
  />
);
