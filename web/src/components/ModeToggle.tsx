// SPDX-License-Identifier: Apache-2.0
import { useEffect } from "react";
import { CircuitBoard, Globe, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useMode, type Mode } from "../lib/use-mode";
import { useAegis } from "../lib/aegis-engine";
import { isLaceAvailable } from "../lib/live-providers";
import { cn } from "../lib/utils";

const labels: Record<Mode, string> = {
  simulator: "Simulator",
  live: "Live · preprod",
};

export const ModeToggle = ({ compact = false }: { compact?: boolean }) => {
  const [mode, setMode] = useMode();
  const { state, setMode: setEngineMode } = useAegis();
  const laceOk = isLaceAvailable();
  const liveDisabled = !laceOk;

  // Keep the engine's mode synced with the URL/localStorage source-of-truth.
  useEffect(() => {
    setEngineMode(mode);
  }, [mode, setEngineMode]);

  const onSwitch = (next: Mode) => {
    if (next === "live" && liveDisabled) return;
    setMode(next);
  };

  const status = state.liveStatus;

  return (
    <div className={cn("flex items-center gap-2", compact ? "" : "")}>
      <div
        role="group"
        aria-label="Engine mode"
        className="inline-flex items-center rounded-full border border-ink-700/70 bg-ink-900/50 backdrop-blur-md p-0.5"
      >
        <button
          type="button"
          onClick={() => onSwitch("simulator")}
          aria-pressed={mode === "simulator"}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
            mode === "simulator"
              ? "bg-ink-50 text-ink-950"
              : "text-ink-300 hover:text-ink-100",
          )}
        >
          <CircuitBoard className="w-3 h-3" />
          {labels.simulator}
        </button>
        <button
          type="button"
          onClick={() => onSwitch("live")}
          disabled={liveDisabled}
          aria-pressed={mode === "live"}
          title={liveDisabled ? "Install Lace Beta to enable live mode" : "Run against Midnight preprod"}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
            mode === "live"
              ? "bg-accent-500 text-ink-950"
              : "text-ink-300 hover:text-ink-100",
            liveDisabled && "opacity-40 cursor-not-allowed",
          )}
        >
          <Globe className="w-3 h-3" />
          {labels.live}
        </button>
      </div>

      {mode === "live" && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-mono",
            status.kind === "ready" && "text-shield-300",
            status.kind === "pending" && "text-warn-400",
            status.kind === "error" && "text-danger-400",
            status.kind === "connecting" && "text-ink-300",
            status.kind === "off" && "text-ink-500",
          )}
        >
          {status.kind === "off" && <span>not connected</span>}
          {status.kind === "connecting" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              connecting
            </>
          )}
          {status.kind === "ready" && (
            <>
              <CheckCircle2 className="w-3 h-3" />
              ready
            </>
          )}
          {status.kind === "pending" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              pending
            </>
          )}
          {status.kind === "error" && (
            <>
              <AlertTriangle className="w-3 h-3" />
              error
            </>
          )}
        </div>
      )}

      {liveDisabled && mode === "simulator" && !compact && (
        <a
          href="https://www.lace.io"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] uppercase tracking-[0.18em] text-ink-500 hover:text-ink-300 transition-colors"
        >
          install lace →
        </a>
      )}
    </div>
  );
};
