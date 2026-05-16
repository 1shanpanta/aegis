// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useAegis } from "../lib/aegis-engine";
import { cn } from "../lib/utils";

export const EventLog = () => {
  const { state } = useAegis();
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state.events.length]);

  return (
    <div className="rounded-2xl border border-ink-800/80 bg-ink-900/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-ink-800 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-ink-400">Event log</div>
        <div className="text-[10px] text-ink-500">{state.events.length} events</div>
      </div>
      <div ref={scrollRef} className="max-h-[180px] overflow-y-auto px-5 py-3 space-y-1.5">
        {state.events.map((event, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 text-xs leading-relaxed",
              event.kind === "success" && "text-shield-300",
              event.kind === "error" && "text-danger-400",
              event.kind === "info" && "text-ink-300",
            )}
          >
            {event.kind === "success" && <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
            {event.kind === "error" && <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
            {event.kind === "info" && <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-ink-500" />}
            <span className="font-mono text-[11px]">{event.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
