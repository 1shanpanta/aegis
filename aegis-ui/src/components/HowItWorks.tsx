// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";
import { KeyRound, Cpu, ScanEye } from "lucide-react";

const ease = [0.2, 0.7, 0.2, 1] as const;

const steps = [
  {
    icon: KeyRound,
    label: "Grant",
    title: "Principal grants a shielded allowance.",
    body: "Limit, counterparty whitelist, and running spend are bound to the principal's witness state. The chain only learns that an allowance is active and who the agent is.",
  },
  {
    icon: Cpu,
    label: "Transact",
    title: "Agent spends inside the circuit.",
    body: "Each spend proves amount + spend_so_far ≤ limit AND counterparty ∈ whitelist. The proof emits a persistentHash commitment. No amount, no counterparty leaks.",
  },
  {
    icon: ScanEye,
    label: "Audit",
    title: "Principal audits, regulator verifies.",
    body: "The principal opens commitments with the shared nonces. A regulator can be issued selective-disclosure keys to verify policy compliance without seeing the strategy.",
  },
];

export const HowItWorks = () => (
  <section className="relative w-full px-6 lg:px-10 py-24 lg:py-32 border-t border-ink-800/80">
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease }}
        className="max-w-2xl"
      >
        <div className="text-[11px] uppercase tracking-[0.2em] text-ink-500 mb-3">
          How it works
        </div>
        <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight tracking-[-0.02em] text-ink-50">
          One Compact contract.{" "}
          <span className="font-serif italic text-accent-300">Three perspectives</span> on the
          same chain state.
        </h2>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
              className="relative rounded-2xl border border-ink-700/70 bg-ink-900/40 backdrop-blur-md p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="rounded-md border border-accent-500/30 bg-accent-500/10 w-9 h-9 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-accent-300" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
                  0{i + 1} · {step.label}
                </span>
              </div>
              <h3 className="text-[17px] leading-snug text-ink-50 font-medium">{step.title}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-300">{step.body}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);
