// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";

const ease = [0.2, 0.7, 0.2, 1] as const;

const steps = [
  {
    n: "01",
    label: "Grant",
    headline: "Principal sets a shielded policy.",
    body: "A cap, a counterparty whitelist, and a running tally. All three live as witnesses on the principal's machine, not as escrowed funds in the contract. The chain only ever learns that an allowance exists and who the agent is.",
  },
  {
    n: "02",
    label: "Transact",
    headline: "Agent spends inside the circuit.",
    body: "Each spend proves amount + spend_so_far ≤ limit and counterparty ∈ whitelist. The circuit emits one opaque persistentHash commitment. No amount, no counterparty, no balance leaks.",
  },
  {
    n: "03",
    label: "Audit",
    headline: "Principal audits, regulator verifies.",
    body: "The principal opens commitments with the shared nonces. Selective-disclosure keys let a regulator confirm policy compliance without seeing the underlying strategy or counterparties.",
  },
];

export const HowItWorks = () => (
  <section className="relative w-full px-6 lg:px-10 py-32 lg:py-48">
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease }}
        className="max-w-3xl mb-24"
      >
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 mb-4">
          How it works
        </div>
        <h2 className="text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.025em] text-ink-50">
          One Compact contract.{" "}
          <span className="font-serif italic text-accent-300">Three perspectives</span> on the same
          chain state.
        </h2>
      </motion.div>

      <div>
        {steps.map((step, i) => (
          <motion.article
            key={step.n}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.85, delay: i * 0.06, ease }}
            className={
              "grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-16 py-12 md:py-16 " +
              (i !== 0 ? "border-t border-ink-800/70" : "")
            }
          >
            <div className="flex md:flex-col items-baseline md:items-start gap-5 md:gap-2">
              <div className="font-serif italic text-[clamp(4.5rem,8vw,7.5rem)] leading-[0.9] text-ink-700 select-none">
                {step.n}
              </div>
              <div className="font-serif italic text-[20px] md:text-[24px] text-accent-300 leading-none mt-auto md:mt-3">
                {step.label}
              </div>
            </div>
            <div className="md:pt-3">
              <h3 className="text-[clamp(1.4rem,2.4vw,1.85rem)] leading-tight tracking-[-0.015em] text-ink-50 mb-5">
                {step.headline}
              </h3>
              <p className="text-[16px] md:text-[17px] leading-[1.65] text-ink-300 max-w-[58ch]">
                {step.body}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);
