// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { useAegis, AllowanceState } from "../lib/aegis-engine";
import { Card, CardHeader, CardBody, CardSection } from "./ui/Card";
import { Badge, Dot } from "./ui/Badge";

const QUICK_AMOUNTS: bigint[] = [5_000n, 25_000n, 100_000n, 250_000n];
const ease = [0.2, 0.7, 0.2, 1] as const;

export const AgentView = () => {
  const { state, spend, formatAmount } = useAegis();
  const { ledger, counterparties } = state;
  const idle = ledger.state !== AllowanceState.ACTIVE;
  const whitelisted = counterparties.filter((c) => c.whitelisted);
  const sanctioned = counterparties.filter((c) => !c.whitelisted);
  const isActive = ledger.state === AllowanceState.ACTIVE;

  return (
    <Card active={isActive}>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-1.5">
            <Bot className="w-3 h-3 text-accent-300" />
            Agent
          </span>
        }
        subtitle="LLM-driven trader operating under the principal's grant."
        trailing={<Badge tone={idle ? "muted" : "active"}>{idle ? "idle" : "online"}</Badge>}
      />

      <CardBody className="space-y-0">
        <CardSection label="Authorized spend">
          {idle && (
            <div className="text-[13px] text-ink-500 italic mb-4">
              Waiting for principal to create the allowance.
            </div>
          )}
          <div className="space-y-3">
            {whitelisted.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 4 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4, ease }}
                className="rounded-lg p-3 bg-ink-900/30 border border-ink-800/60"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <Dot tone="active" />
                    <span className="text-[13px] text-ink-100">{c.label}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-ink-500">
                    {c.subLabel}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {QUICK_AMOUNTS.map((amount) => (
                    <button
                      key={`${c.id}-${amount}`}
                      type="button"
                      onClick={() => spend(c, amount)}
                      disabled={idle}
                      style={{ transitionProperty: "background-color, border-color, color, transform" }}
                      className="text-[12px] font-mono tabular-nums py-2 rounded-md border border-ink-800 bg-ink-950/60 text-ink-200 hover:border-accent-500/40 hover:text-accent-200 hover:bg-accent-500/[0.05] active:scale-[0.96] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-ink-800 disabled:hover:text-ink-200 disabled:hover:bg-ink-950/60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                    >
                      {formatAmount(amount)}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </CardSection>

        <CardSection label="Attack tests · expect reject">
          <div className="space-y-1.5">
            {sanctioned.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => spend(c, 1_000n)}
                disabled={idle}
                style={{ transitionProperty: "background-color, border-color, color, transform" }}
                className="group w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md border border-ink-800/80 bg-ink-950/40 text-[13px] text-ink-300 hover:border-danger-500/30 hover:bg-danger-500/[0.04] hover:text-ink-100 active:scale-[0.98] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-ink-800/80 disabled:hover:bg-ink-950/40 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink-700 group-hover:bg-danger-400 transition-colors" />
                  <span>{c.label}</span>
                </span>
                <span className="text-[11px] text-ink-500 group-hover:text-danger-400 transition-colors font-mono tabular-nums">
                  $10 → reject
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => spend(whitelisted[0], 900_000n)}
              disabled={idle}
              style={{ transitionProperty: "background-color, border-color, color, transform" }}
              className="group w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md border border-ink-800/80 bg-ink-950/40 text-[13px] text-ink-300 hover:border-warn-500/30 hover:bg-warn-500/[0.04] hover:text-ink-100 active:scale-[0.98] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-ink-800/80 disabled:hover:bg-ink-950/40 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              <span className="flex items-center gap-2.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink-700 group-hover:bg-warn-400 transition-colors" />
                <span>Drain attempt</span>
              </span>
              <span className="text-[11px] text-ink-500 group-hover:text-warn-400 transition-colors font-mono tabular-nums">
                $9,000 → over cap
              </span>
            </button>
          </div>
        </CardSection>
      </CardBody>
    </Card>
  );
};
