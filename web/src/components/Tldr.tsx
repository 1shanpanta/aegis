// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const stats = [
  { value: "1", label: "Compact contract", tone: "ink" as const },
  { value: "3", label: "ZK circuits", tone: "ink" as const },
  { value: "5", label: "Private witnesses", tone: "ink" as const },
  { value: "10 / 10", label: "Tests passing", tone: "accent" as const },
];

export const Tldr = () => (
  <section className="relative w-full px-6 lg:px-10 py-16 lg:py-20">
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease }}
        className="rounded-2xl border border-ink-800/70 bg-ink-900/40 backdrop-blur-sm p-8 lg:p-12"
      >
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 mb-5">TL;DR</div>

        <p
          className="text-[clamp(1.25rem,2vw,1.7rem)] leading-[1.35] text-ink-100 max-w-[58ch]"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          A <span className="font-serif italic text-accent-300">shielded allowance</span>{" "}
          primitive for AI agents on Midnight. Cap, counterparty whitelist, and running spend
          live as witnesses. The chain sees opaque commitments. The principal audits with a
          shared key.
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-y-6 sm:gap-y-0 border-t border-ink-800/60 pt-7">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.08 + i * 0.05, duration: 0.45, ease }}
              className={
                "sm:px-5 first:sm:pl-0 last:sm:pr-0 " +
                (i > 0 ? "sm:border-l sm:border-ink-800/60" : "")
              }
            >
              <div
                className={
                  "font-mono text-[26px] leading-none tracking-tight tabular-nums mb-2 " +
                  (s.tone === "accent" ? "text-accent-300" : "text-ink-50")
                }
              >
                {s.value}
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-mono text-ink-400">
          <a
            href="#demo"
            className="inline-flex items-center gap-1.5 text-accent-300 hover:text-accent-400 group"
          >
            jump to live demo
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" style={{ transitionProperty: "transform" }} />
          </a>
          <a
            href="https://github.com/1shanpanta/aegis"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink-100 transition-colors"
            style={{ transitionProperty: "color" }}
          >
            source on GitHub
          </a>
          <a
            href="docs/live-mode-guide.html"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink-100 transition-colors"
            style={{ transitionProperty: "color" }}
          >
            live-mode guide
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);
