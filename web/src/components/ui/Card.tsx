// SPDX-License-Identifier: Apache-2.0
import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

/**
 * Concentric border-radius scale used throughout the demo cards:
 *
 *   outer (Card)     → rounded-2xl  (16px)
 *   section interior → rounded-lg   (8px)   (with 8-12px inner padding)
 *   pill / chip      → rounded-md   (6px)
 */
export const Card = ({
  className,
  children,
  active = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { active?: boolean }) => (
  <div
    className={cn(
      "relative rounded-2xl border bg-ink-900/40 backdrop-blur-sm overflow-hidden",
      "transition-colors duration-300",
      active
        ? "border-accent-500/30 shadow-[0_0_0_1px_rgba(59,130,246,0.06),0_30px_60px_-30px_rgba(59,130,246,0.18)]"
        : "border-ink-800/70 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]",
      className,
    )}
    style={{ transitionProperty: "border-color, box-shadow" }}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({
  title,
  subtitle,
  trailing,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 px-7 pt-7 pb-5">
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-ink-500 mb-2">{title}</div>
      {subtitle && (
        <div
          className="text-[15px] text-ink-200 leading-snug max-w-[28ch]"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          {subtitle}
        </div>
      )}
    </div>
    {trailing && <div className="shrink-0 mt-1">{trailing}</div>}
  </div>
);

export const CardBody = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <div className={cn("px-7 pb-7", className)}>{children}</div>;

export const CardSection = ({
  label,
  children,
  className,
}: {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "py-5 first:pt-0 last:pb-0 border-t border-ink-800/60 first:border-t-0",
      className,
    )}
  >
    {label && (
      <div className="text-[10px] uppercase tracking-[0.22em] text-ink-500 mb-3">{label}</div>
    )}
    {children}
  </div>
);
