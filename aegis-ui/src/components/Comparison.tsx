// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const rows: {
  attribute: string;
  values: { label: string; ok: boolean; tone?: "muted" }[];
}[] = [
  {
    attribute: "Spending limit hidden from chain",
    values: [
      { label: "TEE-only", ok: false },
      { label: "Public", ok: false },
      { label: "n/a", ok: false, tone: "muted" },
      { label: "ZK witness", ok: true },
    ],
  },
  {
    attribute: "Counterparty whitelist hidden",
    values: [
      { label: "TEE-only", ok: false },
      { label: "Public", ok: false },
      { label: "n/a", ok: false, tone: "muted" },
      { label: "ZK witness", ok: true },
    ],
  },
  {
    attribute: "Cross-org auditability",
    values: [
      { label: "weak", ok: false },
      { label: "strong", ok: true },
      { label: "n/a", ok: false, tone: "muted" },
      { label: "strong", ok: true },
    ],
  },
  {
    attribute: "Open-source contract",
    values: [
      { label: "no", ok: false },
      { label: "yes", ok: true },
      { label: "yes", ok: true },
      { label: "yes", ok: true },
    ],
  },
  {
    attribute: "Shipped on a privacy-native chain",
    values: [
      { label: "no", ok: false },
      { label: "no", ok: false },
      { label: "partial", ok: false },
      { label: "yes", ok: true },
    ],
  },
];

const cols = ["Coinbase Agentic", "Google AP2", "Aleo for Agents", "Aegis"];

export const Comparison = () => (
  <section className="relative w-full px-6 lg:px-10 py-24 lg:py-32 border-t border-ink-800/80">
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease }}
        className="max-w-2xl mb-12"
      >
        <div className="text-[11px] uppercase tracking-[0.2em] text-ink-500 mb-3">
          Versus the field
        </div>
        <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight tracking-[-0.02em] text-ink-50">
          The shipped <span className="font-serif italic text-accent-300">privacy primitive</span>{" "}
          the agent stack is missing.
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease, delay: 0.05 }}
        className="rounded-2xl border border-ink-700/70 bg-ink-900/40 backdrop-blur-md overflow-hidden"
      >
        <div className="grid grid-cols-[1.6fr_repeat(4,1fr)] text-[11px] uppercase tracking-[0.18em] text-ink-500 border-b border-ink-700/70">
          <div className="px-4 lg:px-6 py-4">Attribute</div>
          {cols.map((c, i) => (
            <div
              key={c}
              className={
                "px-4 py-4 text-center " + (i === cols.length - 1 ? "text-accent-300" : "")
              }
            >
              {c}
            </div>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div
            key={row.attribute}
            className={
              "grid grid-cols-[1.6fr_repeat(4,1fr)] items-center text-[13px] " +
              (ri !== rows.length - 1 ? "border-b border-ink-800/80" : "")
            }
          >
            <div className="px-4 lg:px-6 py-4 text-ink-200">{row.attribute}</div>
            {row.values.map((v, ci) => (
              <div
                key={ci}
                className={
                  "px-4 py-4 flex items-center justify-center gap-1.5 " +
                  (ci === row.values.length - 1
                    ? "bg-accent-500/[0.05] text-accent-200"
                    : v.tone === "muted"
                    ? "text-ink-500"
                    : v.ok
                    ? "text-shield-300"
                    : "text-ink-400")
                }
              >
                {v.tone === "muted" ? null : v.ok ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <X className="w-3.5 h-3.5 text-ink-500" />
                )}
                <span className="text-[12px] tabular-nums">{v.label}</span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);
