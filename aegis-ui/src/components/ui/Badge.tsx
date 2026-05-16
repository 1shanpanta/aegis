// SPDX-License-Identifier: Apache-2.0
import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

type Tone = "neutral" | "blue" | "green" | "amber" | "rose" | "violet";

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
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border",
      tone === "neutral" && "border-ink-700 bg-ink-800/60 text-ink-300",
      tone === "blue" && "border-accent-500/30 bg-accent-500/10 text-accent-300",
      tone === "green" && "border-shield-500/30 bg-shield-500/10 text-shield-300",
      tone === "amber" && "border-warn-500/30 bg-warn-500/10 text-warn-400",
      tone === "rose" && "border-danger-500/30 bg-danger-500/10 text-danger-400",
      tone === "violet" && "border-violet-500/30 bg-violet-500/10 text-violet-300",
      className,
    )}
  >
    {children}
  </span>
);
