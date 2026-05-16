// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import { Shader } from "./Shader";

const ease = [0.2, 0.7, 0.2, 1] as const;

type Verdict = "yes" | "no" | "na";

type Competitor = {
  name: string;
  approach: string;
  attrs: { label: string; verdict: Verdict; note?: string }[];
};

const competitors: Competitor[] = [
  {
    name: "Coinbase Agentic",
    approach: "TEE-enforced policy",
    attrs: [
      { label: "Limit hidden from chain", verdict: "no", note: "TEE-only" },
      { label: "Counterparty whitelist hidden", verdict: "no", note: "TEE-only" },
      { label: "Cross-org auditable", verdict: "no", note: "weak" },
    ],
  },
  {
    name: "Google AP2",
    approach: "Signed JSON mandates",
    attrs: [
      { label: "Limit hidden from chain", verdict: "no", note: "public" },
      { label: "Counterparty whitelist hidden", verdict: "no", note: "public" },
      { label: "Cross-org auditable", verdict: "yes" },
    ],
  },
  {
    name: "Aleo for Agents",
    approach: "Generic ZK execution",
    attrs: [
      { label: "Limit hidden from chain", verdict: "na" },
      { label: "Counterparty whitelist hidden", verdict: "na" },
      { label: "Cross-org auditable", verdict: "na" },
    ],
  },
];

const aegisAttrs = [
  { label: "Limit hidden from chain", verdict: "yes" as const, note: "ZK witness" },
  { label: "Counterparty whitelist hidden", verdict: "yes" as const, note: "ZK witness" },
  { label: "Cross-org auditable", verdict: "yes" as const, note: "selective disclosure" },
  { label: "Open-source Compact contract", verdict: "yes" as const, note: "MIT" },
];

const Icon = ({ v }: { v: Verdict }) => {
  if (v === "yes") return <Check className="w-3.5 h-3.5 text-shield-400" />;
  if (v === "no") return <X className="w-3.5 h-3.5 text-ink-500" />;
  return <Minus className="w-3.5 h-3.5 text-ink-700" />;
};

export const Comparison = () => (
  <section className="relative w-full px-6 lg:px-10 py-32 lg:py-48">
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease }}
        className="max-w-3xl mb-20"
      >
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 mb-4">
          Compared to what&rsquo;s shipping today
        </div>
        <h2 className="text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.025em] text-ink-50">
          The shipped{" "}
          <span className="font-serif italic text-accent-300">privacy primitive</span> the agent
          stack is missing.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-800/60 rounded-2xl overflow-hidden border border-ink-800/60 mb-px">
        {competitors.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.7, delay: i * 0.06, ease }}
            className="bg-ink-950 p-8 lg:p-10"
          >
            <div className="text-[10px] uppercase tracking-[0.22em] text-ink-500 mb-3">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="text-[20px] tracking-tight text-ink-100 mb-1.5">{c.name}</div>
            <div className="font-serif italic text-[15px] text-ink-400 mb-7">
              {c.approach}
            </div>
            <ul className="space-y-3">
              {c.attrs.map((a) => (
                <li
                  key={a.label}
                  className="flex items-start gap-2.5 text-[13px] text-ink-300 leading-snug"
                >
                  <Icon v={a.verdict} />
                  <span>
                    {a.label}
                    {a.note && (
                      <span className="block text-[11px] text-ink-500 mt-0.5">— {a.note}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Aegis card — full width, distinct, shader peek */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.9, delay: 0.2, ease }}
        className="relative rounded-2xl overflow-hidden border border-accent-500/40"
      >
        <div className="absolute inset-0 isolate">
          <Shader />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/70 to-ink-950/30" />
        </div>
        <div className="relative p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-accent-300 mb-3">
              04 · Aegis
            </div>
            <div className="text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.05] tracking-[-0.02em] text-ink-50 mb-3">
              Shielded by{" "}
              <span className="font-serif italic text-accent-300">construction</span>.
            </div>
            <p className="text-[15px] leading-relaxed text-ink-200 max-w-md">
              Compact-native witnesses bind the cap and the whitelist. The circuit emits a
              persistentHash commitment per spend. Auditors get selective disclosure. Outsiders
              get cryptographic silence.
            </p>
          </div>
          <ul className="space-y-4">
            {aegisAttrs.map((a) => (
              <li
                key={a.label}
                className="flex items-start gap-3 text-[14px] text-ink-100 leading-snug"
              >
                <span className="mt-0.5">
                  <Icon v={a.verdict} />
                </span>
                <span>
                  {a.label}
                  {a.note && (
                    <span className="block text-[12px] text-shield-300 mt-1 font-mono">
                      {a.note}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  </section>
);
