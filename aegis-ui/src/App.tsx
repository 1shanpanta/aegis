// SPDX-License-Identifier: Apache-2.0
import { Header } from "./components/Header";
import { PrincipalView } from "./components/PrincipalView";
import { AgentView } from "./components/AgentView";
import { PublicView } from "./components/PublicView";
import { EventLog } from "./components/EventLog";
import { useAegis } from "./lib/aegis-engine";
import { Sparkles } from "lucide-react";

const App = () => {
  const { reset } = useAegis();

  return (
    <div className="min-h-screen flex flex-col">
      <Header onReset={reset} />

      <main className="flex-1 mx-auto max-w-[1400px] w-full px-6 py-6 flex flex-col gap-6">
        <section className="rounded-2xl border border-ink-800/60 bg-gradient-to-br from-ink-900/40 via-ink-900/20 to-transparent px-6 py-5 flex items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent-300 mb-2">
              <Sparkles className="w-3 h-3" /> Midnight Hackathon · May 2026 · AI Track
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-ink-100 mb-1.5">
              The shielded audit primitive every regulated enterprise needs to deploy AI agents.
            </h1>
            <p className="text-sm text-ink-400 leading-relaxed">
              A Compact-native contract on Midnight that gives an AI agent a shielded spending budget
              with a shielded counterparty whitelist. Outsiders see opaque commitments. The principal
              audits with a shared key. Compliance officers verify policy without exposing strategy.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-1 text-right">
            <div className="text-[10px] uppercase tracking-wider text-ink-500">Compares against</div>
            <div className="text-xs text-ink-300">Coinbase Agentic Wallets · TEE-based</div>
            <div className="text-xs text-ink-300">Google AP2 · signed but public</div>
            <div className="text-xs text-ink-300">Aleo for Agents · no allowance primitive</div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
          <PrincipalView />
          <AgentView />
          <PublicView />
        </section>

        <EventLog />
      </main>

      <footer className="border-t border-ink-800 mt-6 py-5 text-center text-xs text-ink-500">
        Aegis · 100% Compact · same contract deploys to Midnight mainnet. Demo runs the witness +
        circuit pipeline in-browser via the AegisSimulator.
      </footer>
    </div>
  );
};

export default App;
