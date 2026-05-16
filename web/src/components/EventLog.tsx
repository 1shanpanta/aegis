// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef } from "react";
import { useAegis } from "../lib/aegis-engine";
import { cn } from "../lib/utils";

export const EventLog = () => {
  const { state } = useAegis();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [state.events.length]);

  return (
    <div className="rounded-2xl border border-ink-800/70 bg-ink-900/40 backdrop-blur-sm overflow-hidden">
      <div className="px-7 py-4 border-b border-ink-800/60 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.22em] text-ink-500">Event log</div>
        <div className="text-[10px] font-mono tabular-nums text-ink-600">
          {state.events.length} events
        </div>
      </div>
      <div ref={scrollRef} className="max-h-[200px] overflow-y-auto px-7 py-4 space-y-1.5">
        {state.events.map((event, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 text-[12px] leading-relaxed font-mono",
              event.kind === "success" && "text-ink-100",
              event.kind === "error" && "text-ink-300",
              event.kind === "info" && "text-ink-400",
            )}
          >
            <span
              className={cn(
                "inline-block w-1 h-1 rounded-full mt-2 shrink-0",
                event.kind === "success" && "bg-accent-400",
                event.kind === "error" && "bg-ink-500",
                event.kind === "info" && "bg-ink-700",
              )}
            />
            <span className="tabular-nums">{event.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
