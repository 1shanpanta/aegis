// SPDX-License-Identifier: Apache-2.0
import { Shield, RefreshCw, Github } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

export const Header = ({ onReset }: { onReset: () => void }) => (
  <header className="border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-md sticky top-0 z-20">
    <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="w-7 h-7 text-accent-400" />
          <div className="absolute inset-0 blur-md bg-accent-500/30 -z-10" />
        </div>
        <div className="leading-tight">
          <div className="text-base font-semibold tracking-tight text-ink-100 flex items-center gap-2">
            Aegis
            <Badge tone="blue">on Midnight</Badge>
          </div>
          <div className="text-xs text-ink-400">Shielded allowances for AI agent wallets</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/midnightntwrk/compact"
          target="_blank"
          rel="noreferrer"
          className="text-ink-400 hover:text-ink-200 transition-colors"
          aria-label="Compact GitHub"
        >
          <Github className="w-4 h-4" />
        </a>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RefreshCw className="w-3.5 h-3.5" />
          Reset demo
        </Button>
      </div>
    </div>
  </header>
);
