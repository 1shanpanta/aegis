// SPDX-License-Identifier: Apache-2.0
import { ShieldCheck, EyeOff, Lock, ListChecks, Ban } from "lucide-react";
import { useAegis, AllowanceState } from "../lib/aegis-engine";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { shortHex } from "../lib/utils";

const stateLabel: Record<AllowanceState, string> = {
  [AllowanceState.UNINITIALIZED]: "Not created",
  [AllowanceState.ACTIVE]: "Active",
  [AllowanceState.REVOKED]: "Revoked",
};

const stateTone: Record<AllowanceState, "neutral" | "green" | "rose"> = {
  [AllowanceState.UNINITIALIZED]: "neutral",
  [AllowanceState.ACTIVE]: "green",
  [AllowanceState.REVOKED]: "rose",
};

export const PrincipalView = () => {
  const { state, createAllowance, revoke, formatAmount } = useAegis();
  const { ledger, privateState, auditLog, counterparties } = state;
  const remaining = privateState.allowanceLimit - privateState.spendSoFar;
  const pct = Number(
    (privateState.spendSoFar * 1000n) / (privateState.allowanceLimit || 1n),
  ) / 10;
  const whitelistedCps = counterparties.filter((c) => c.whitelisted);

  return (
    <Card accent="blue" className="flex flex-col h-full">
      <CardHeader
        icon={<ShieldCheck className="w-4 h-4 text-accent-400" />}
        title="Principal"
        subtitle="You, the human delegator. You hold the witness keys."
        badge={<Badge tone={stateTone[ledger.state]}>{stateLabel[ledger.state]}</Badge>}
      />

      <CardBody className="flex-1 flex flex-col gap-4">
        {/* Allowance limit */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-xs uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Shielded allowance
            </div>
            <div className="text-xs text-ink-500">witness · client-only</div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-semibold tracking-tight text-ink-100 font-mono">
              {formatAmount(privateState.allowanceLimit)}
            </div>
            <div className="text-xs text-ink-400">total cap</div>
          </div>
          <div className="mt-3 h-1.5 bg-ink-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-500 to-shield-500 transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-ink-400">
              Spent <span className="font-mono text-ink-200">{formatAmount(privateState.spendSoFar)}</span>
            </span>
            <span className="text-ink-400">
              Remaining{" "}
              <span className="font-mono text-shield-300">{formatAmount(remaining)}</span>
            </span>
          </div>
        </div>

        {/* Whitelist */}
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-400 flex items-center gap-1.5 mb-2">
            <ListChecks className="w-3 h-3" /> Shielded whitelist · 3 counterparties
          </div>
          <div className="space-y-1.5">
            {whitelistedCps.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-ink-800/50 border border-ink-700/40"
              >
                <div>
                  <div className="text-xs text-ink-100">{c.label}</div>
                  <div className="text-[10px] text-ink-500 font-mono">{shortHex(c.address)}</div>
                </div>
                <Badge tone="green">allowed</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Audit log */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="text-xs uppercase tracking-wider text-ink-400 flex items-center gap-1.5 mb-2">
            <EyeOff className="w-3 h-3" /> Audit log · principal-only
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {auditLog.length === 0 ? (
              <div className="text-xs text-ink-500 italic px-2 py-3">
                Agent has not transacted yet.
              </div>
            ) : (
              auditLog.map((entry, i) => {
                const cp = counterparties.find(
                  (c) => shortHex(c.address) === shortHex(entry.counterparty),
                );
                return (
                  <div
                    key={i}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-ink-800/40 border border-ink-700/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-ink-300 w-5 text-ink-500">#{i + 1}</span>
                      <span className="font-mono text-ink-100">{formatAmount(entry.amount)}</span>
                      <span className="text-ink-500">→</span>
                      <span className="text-ink-200">{cp?.label ?? shortHex(entry.counterparty)}</span>
                    </div>
                    <span className="text-[10px] text-ink-500">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-ink-800/60">
          {ledger.state === AllowanceState.UNINITIALIZED && (
            <Button variant="primary" onClick={createAllowance} className="flex-1">
              Create allowance
            </Button>
          )}
          {ledger.state === AllowanceState.ACTIVE && (
            <Button variant="danger" onClick={revoke} className="flex-1">
              <Ban className="w-3.5 h-3.5" /> Revoke allowance
            </Button>
          )}
          {ledger.state === AllowanceState.REVOKED && (
            <div className="flex-1 text-center text-xs text-ink-500 py-2">
              Allowance revoked. Reset demo to create a new one.
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
