// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const useCases = [
  {
    sector: "Enterprise AI",
    body: "Audit-ready agents for SOC2 + EU AI Act deployments.",
  },
  {
    sector: "Algo trading",
    body: "Hide strategy from the chain, prove policy compliance.",
  },
  {
    sector: "DAO treasuries",
    body: "Delegate spend to bots, revoke and audit on demand.",
  },
  {
    sector: "Procurement bots",
    body: "Supplier lists stay private, spend caps stay enforced.",
  },
];

export const Tldr = () => (
  <section id="tldr" className="relative w-full px-6 lg:px-10 py-16 lg:py-20 scroll-mt-12">
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

        <div className="mt-10 mb-2 text-[10px] uppercase tracking-[0.22em] text-ink-500 border-t border-ink-800/60 pt-7">
          Where this is useful
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 sm:gap-y-7 lg:gap-y-0 mt-4">
          {useCases.map((u, i) => (
            <motion.div
              key={u.sector}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.08 + i * 0.05, duration: 0.45, ease }}
              className={
                "lg:px-5 first:lg:pl-0 last:lg:pr-0 " +
                (i > 0 ? "lg:border-l lg:border-ink-800/60" : "")
              }
            >
              <div className="text-[13px] text-ink-50 font-medium mb-1.5 tracking-tight">
                {u.sector}
              </div>
              <p
                className="text-[12.5px] leading-[1.55] text-ink-400 max-w-[28ch]"
                style={{ textWrap: "pretty" } as React.CSSProperties}
              >
                {u.body}
              </p>
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
