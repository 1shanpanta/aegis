// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Shield } from "lucide-react";
import { Shader } from "./Shader";
import { UtcClock, PulseDot } from "./LiveChrome";
import { AuthButton } from "./AuthButton";

const ease = [0.2, 0.7, 0.2, 1] as const;

export const Hero = () => (
  <section className="relative isolate h-[100svh] min-h-[680px] w-full overflow-hidden flex flex-col">
    <Shader />
    {/* Subtle dark gradient so text stays readable over the shader */}
    <div
      aria-hidden
      className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/10 to-ink-950"
    />

    {/* Top bar — brand + live chrome */}
    <div className="relative z-10 flex items-center justify-between px-6 lg:px-10 pt-6 shrink-0">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="flex items-center gap-2 text-[13px] text-ink-200"
      >
        <Shield className="w-3.5 h-3.5 text-accent-300" />
        <span className="tracking-tight">Aegis</span>
        <span className="text-ink-500">·</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">demo</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease }}
        className="flex items-center gap-2.5"
      >
        <div className="flex items-center gap-3 rounded-full bg-ink-900/50 border border-ink-700/60 backdrop-blur-md px-3.5 py-1.5">
          <span className="flex items-center gap-1.5 text-[11px] text-ink-200">
            <PulseDot tone="shield" />
            on Midnight
          </span>
          <span className="text-ink-700">|</span>
          <UtcClock />
        </div>
        <AuthButton />
      </motion.div>
    </div>

    {/* Centerpiece — vertically centered in remaining flex space */}
    <div className="relative z-10 mx-auto max-w-4xl px-6 flex-1 flex flex-col justify-center pb-16">
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.1, ease }}
        className="text-[clamp(2.4rem,6.5vw,5.2rem)] leading-[1.02] tracking-[-0.02em] text-ink-50 font-medium"
      >
        AI agents that don&rsquo;t{" "}
        <span className="font-serif italic text-accent-300">leak.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.22, ease }}
        className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-200"
      >
        A Compact-native primitive on Midnight that gives an AI agent a{" "}
        <span className="text-ink-50">shielded spending allowance</span> with a{" "}
        <span className="text-ink-50">private counterparty whitelist</span>. The chain sees opaque
        commitments. The principal audits with a shared key.
      </motion.p>

      {/* Glass-card CTA */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.34, ease }}
        className="mt-9 inline-flex flex-wrap items-center gap-3"
      >
        <a
          href="#demo"
          className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-ink-950 bg-ink-50 hover:bg-white transition-colors"
        >
          Try the live demo
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
        <a
          href="#demo-video"
          className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-ink-100 bg-ink-50/[0.06] hover:bg-ink-50/[0.12] border border-ink-50/15 backdrop-blur-md transition-colors"
          style={{ transitionProperty: "background-color, color" }}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          Demo video
        </a>
        <a
          href="#tldr"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-ink-300 hover:text-ink-100 transition-colors"
          style={{ transitionProperty: "color" }}
        >
          TL;DR
          <ArrowRight className="w-3.5 h-3.5 rotate-90" />
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.7, ease }}
        className="mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-ink-300"
      >
        <span className="inline-block w-8 h-px bg-ink-500" />
        Submission · Midnight Hackathon · May 2026 · AI Track
      </motion.div>
    </div>

    {/* Footer-of-hero hint to scroll */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 1.0, ease }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-ink-500"
    >
      Scroll
      <span className="block w-px h-8 bg-gradient-to-b from-ink-500/80 to-transparent" />
    </motion.div>
  </section>
);
