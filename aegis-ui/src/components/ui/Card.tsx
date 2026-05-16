// SPDX-License-Identifier: Apache-2.0
import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export const Card = ({
  className,
  children,
  accent,
  ...props
}: HTMLAttributes<HTMLDivElement> & { accent?: "blue" | "green" | "amber" | "rose" }) => (
  <div
    className={cn(
      "relative rounded-2xl border border-ink-700/80 bg-ink-900/60 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden",
      accent === "blue" && "ring-1 ring-accent-500/20",
      accent === "green" && "ring-1 ring-shield-500/20",
      accent === "amber" && "ring-1 ring-warn-500/20",
      accent === "rose" && "ring-1 ring-danger-500/20",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({
  title,
  subtitle,
  icon,
  badge,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-ink-700/60">
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-ink-300">{icon}</div>}
      <div>
        <div className="text-sm font-semibold tracking-tight text-ink-100">{title}</div>
        {subtitle && <div className="text-xs text-ink-400 mt-0.5">{subtitle}</div>}
      </div>
    </div>
    {badge && <div className="shrink-0">{badge}</div>}
  </div>
);

export const CardBody = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <div className={cn("px-5 py-4", className)}>{children}</div>;
