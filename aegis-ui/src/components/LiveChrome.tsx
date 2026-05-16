// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";

const pad = (n: number) => n.toString().padStart(2, "0");

export const UtcClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-[11px] tracking-tight tabular-nums text-ink-300">
      {pad(now.getUTCHours())}:{pad(now.getUTCMinutes())}:{pad(now.getUTCSeconds())} UTC
    </span>
  );
};

export const PulseDot = ({
  tone = "shield",
  className,
}: {
  tone?: "shield" | "accent" | "warn";
  className?: string;
}) => {
  const ring =
    tone === "shield"
      ? "bg-shield-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]"
      : tone === "accent"
      ? "bg-accent-400 shadow-[0_0_0_4px_rgba(96,165,250,0.18)]"
      : "bg-warn-400 shadow-[0_0_0_4px_rgba(251,191,36,0.18)]";
  return <span className={`pulse-dot inline-block w-1.5 h-1.5 rounded-full ${ring} ${className ?? ""}`} />;
};
