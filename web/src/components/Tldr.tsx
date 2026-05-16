// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";

const ease = [0.2, 0.7, 0.2, 1] as const;

const stats = [
  { value: "1", label: "Compact contract", tone: "ink" },
  { value: "10 / 10", label: "Tests passing", tone: "accent" },
  { value: "3", label: "ZK circuits", tone: "ink" },
  { value: "5", label: "Private witnesses", tone: "ink" },
] as const;

export const Tldr = () => (
  <section className="relative w-full px-6 lg:px-10 py-16 lg:py-20">
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease }}
        className="rounded-2xl border border-ink-800/70 bg-ink-900/40 backdrop-blur-sm shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-12 p-8 lg:p-12 items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 mb-4">
              TL;DR
            </div>
            <p
              className="text-[clamp(1.2rem,2vw,1.55rem)] leading-snug text-ink-100"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              A <span className="font-serif italic text-accent-300">shielded allowance</span>{" "}
              primitive for AI agents on Midnight. Cap, counterparty whitelist, and running spend
              live as witnesses. The chain sees only opaque commitments. The principal audits with
              a shared key.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-mono text-ink-400">
              <a
                href="#demo"
                className="text-accent-300 hover:text-accent-400 underline-offset-4 hover:underline"
              >
                jump to live demo →
              </a>
              <a
                href="https://github.com/1shanpanta/aegis"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink-100"
              >
                source on GitHub
              </a>
              <a
                href="docs/live-mode-guide.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink-100"
              >
                live-mode guide
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 self-center">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease }}
              >
                <div
                  className={
                    "font-mono text-[28px] leading-none tracking-tight tabular-nums mb-1.5 " +
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
        </div>
      </motion.div>
    </div>
  </section>
);
