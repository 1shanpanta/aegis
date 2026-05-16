// SPDX-License-Identifier: Apache-2.0
import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export const Card = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative rounded-2xl border border-ink-800/70 bg-ink-900/40 backdrop-blur-sm overflow-hidden",
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
        <div className="text-[15px] text-ink-200 leading-snug max-w-[28ch]">{subtitle}</div>
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
  <div className={cn("py-5 first:pt-0 last:pb-0 border-t border-ink-800/60 first:border-t-0", className)}>
    {label && (
      <div className="text-[10px] uppercase tracking-[0.22em] text-ink-500 mb-3">{label}</div>
    )}
    {children}
  </div>
);
