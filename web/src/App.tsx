// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";
import { Hero } from "./components/Hero";
import { Tldr } from "./components/Tldr";
import { HowItWorks } from "./components/HowItWorks";
import { DemoVideo } from "./components/DemoVideo";
import { Comparison } from "./components/Comparison";
import { PrincipalView } from "./components/PrincipalView";
import { AgentView } from "./components/AgentView";
import { PublicView } from "./components/PublicView";
import { EventLog } from "./components/EventLog";
import { useAegis } from "./lib/aegis-engine";
import { ModeToggle } from "./components/ModeToggle";
import { Shader } from "./components/Shader";

const ease = [0.2, 0.7, 0.2, 1] as const;

const App = () => {
  const { reset } = useAegis();

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />

      <Tldr />

      <HowItWorks />

      <DemoVideo
        embedUrl={import.meta.env.VITE_DEMO_EMBED_URL as string | undefined}
        videoSrc={import.meta.env.VITE_DEMO_VIDEO_URL as string | undefined}
        poster={import.meta.env.VITE_DEMO_POSTER_URL as string | undefined}
      />

      <Comparison />

      <section
        id="demo"
        className="relative w-full px-6 lg:px-10 py-24 lg:py-28 overflow-hidden isolate"
      >
        {/* Quiet shader behind the section header — fades to ink before the cards. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[40%] -z-10 pointer-events-none opacity-40"
        >
          <Shader />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/80 to-ink-950" />
        </div>
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-accent-300 mb-3">
                <Sparkles className="w-3 h-3" /> Interactive demo
              </div>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight tracking-[-0.02em] text-ink-50">
                Same chain state.{" "}
                <span className="font-serif italic text-accent-300">Three valid views</span> of it.
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-300">
                Click <span className="text-ink-100">Create allowance</span> as principal, then run
                spends and attacks as the agent. Watch the public chain pane: amounts and
                counterparties never appear, only opaque commitments.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start lg:self-end flex-wrap">
              <ModeToggle />
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-[11px] text-ink-300 hover:text-ink-100 transition-colors border border-ink-700/80 rounded-full px-3 py-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease, delay: 0.06 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <PrincipalView />
            <AgentView />
            <PublicView />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease, delay: 0.12 }}
            className="mt-8"
          >
            <EventLog />
          </motion.div>
        </div>
      </section>

      <Tldr />

      <footer className="border-t border-ink-800/80 px-6 lg:px-10 py-10">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12px] text-ink-500">
          <div className="flex items-center gap-2">
            <span className="text-ink-300">Aegis</span>
            <span>·</span>
            <span>100% Compact</span>
            <span>·</span>
            <span>same contract deploys to Midnight mainnet</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/1shanpanta/aegis"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink-200 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink-200 transition-colors"
            >
              Midnight Network
            </a>
            <a
              href="https://docs.midnight.network/compact"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink-200 transition-colors"
            >
              Compact docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
