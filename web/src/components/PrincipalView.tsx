// SPDX-License-Identifier: Apache-2.0
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Inbox, Copy } from "lucide-react";
import { useAegis, AllowanceState } from "../lib/aegis-engine";
import { Card, CardHeader, CardBody, CardSection } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge, Dot } from "./ui/Badge";
import { shortHex } from "../lib/utils";

const stateBadge: Record<
  AllowanceState,
  { label: string; tone: "neutral" | "active" | "muted" }
> = {
  [AllowanceState.UNINITIALIZED]: { label: "idle", tone: "muted" },
  [AllowanceState.ACTIVE]: { label: "active", tone: "active" },
  [AllowanceState.REVOKED]: { label: "revoked", tone: "muted" },
};

const ease = [0.2, 0.7, 0.2, 1] as const;

const copyToClipboard = (text: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => undefined);
  }
};

export const PrincipalView = () => {
  const { state, createAllowance, revoke, formatAmount } = useAegis();
  const { ledger, privateState, auditLog, counterparties } = state;
  const remaining = privateState.allowanceLimit - privateState.spendSoFar;
  const pct =
    Number((privateState.spendSoFar * 1000n) / (privateState.allowanceLimit || 1n)) / 10;
  const whitelisted = counterparties.filter((c) => c.whitelisted);
  const badge = stateBadge[ledger.state];
  const isActive = ledger.state === AllowanceState.ACTIVE;

  return (
    <Card active={isActive}>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-accent-300" />
            Principal
          </span>
        }
        subtitle="The human delegator. Holds the witness keys."
        trailing={<Badge tone={badge.tone}>{badge.label}</Badge>}
      />

      <CardBody className="space-y-0">
        <CardSection>
          <div className="flex items-baseline gap-2.5">
            <div className="text-[36px] tracking-tight text-ink-50 font-medium font-mono tabular-nums leading-none">
              {formatAmount(privateState.allowanceLimit)}
            </div>
            <div className="text-[12px] text-ink-500">shielded cap</div>
          </div>
          <div className="mt-5 h-[2px] bg-ink-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-500 to-accent-400"
              initial={false}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.6, ease }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] font-mono tabular-nums">
            <span className="text-ink-500">
              spent <span className="text-ink-200">{formatAmount(privateState.spendSoFar)}</span>
            </span>
            <span className="text-ink-500">
              remaining <span className="text-accent-300">{formatAmount(remaining)}</span>
            </span>
          </div>
        </CardSection>

        <CardSection label="Whitelist · 3 counterparties">
          <ul className="space-y-0.5">
            {whitelisted.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, x: -4 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.35, ease }}
                className="group flex items-center justify-between py-2 px-2 -mx-2 rounded-md text-[13px] hover:bg-ink-800/40"
                style={{ transitionProperty: "background-color", transitionDuration: "200ms" }}
              >
                <div className="flex items-center gap-2.5">
                  <Dot tone="active" />
                  <span className="text-ink-100">{c.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-500 tabular-nums">
                    {shortHex(c.address)}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(shortHex(c.address, 32, 0))}
                    aria-label="Copy address"
                    className="opacity-0 group-hover:opacity-100 text-ink-500 hover:text-ink-200 p-0.5 -m-0.5 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 rounded"
                    style={{ transitionProperty: "opacity, color, transform", transitionDuration: "150ms" }}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        </CardSection>

        <CardSection label="Audit log">
          {auditLog.length === 0 ? (
            <div className="flex items-center gap-2.5 py-3 text-[13px] text-ink-500">
              <Inbox className="w-3.5 h-3.5 shrink-0" />
              <span>Agent has not transacted yet.</span>
            </div>
          ) : (
            <ul className="space-y-0.5 max-h-[200px] overflow-y-auto -mx-2">
              <AnimatePresence initial={false}>
                {auditLog.map((entry, i) => {
                  const cp = counterparties.find(
                    (c) => shortHex(c.address) === shortHex(entry.counterparty),
                  );
                  return (
                    <motion.li
                      key={`${entry.timestamp}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 2 }}
                      transition={{ duration: 0.3, ease }}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] hover:bg-ink-800/40"
                      style={{ transitionProperty: "background-color", transitionDuration: "200ms" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[11px] text-ink-600 tabular-nums w-5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-ink-100 tabular-nums">
                          {formatAmount(entry.amount)}
                        </span>
                        <span className="text-ink-600">→</span>
                        <span className="text-ink-200">
                          {cp?.label ?? shortHex(entry.counterparty)}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-ink-600 tabular-nums">
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </CardSection>

        <div className="pt-5 mt-1 border-t border-ink-800/60">
          {ledger.state === AllowanceState.UNINITIALIZED && (
            <Button variant="primary" onClick={createAllowance} className="w-full">
              Create allowance
            </Button>
          )}
          {ledger.state === AllowanceState.ACTIVE && (
            <Button variant="secondary" onClick={revoke} className="w-full">
              Revoke allowance
            </Button>
          )}
          {ledger.state === AllowanceState.REVOKED && (
            <div className="text-center text-[12px] text-ink-500 py-1">
              Allowance revoked. Reset to create a new one.
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
