// SPDX-License-Identifier: Apache-2.0
import { Bot, Zap, ShieldOff } from "lucide-react";
import { useAegis, AllowanceState } from "../lib/aegis-engine";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

const QUICK_AMOUNTS: bigint[] = [5_000n, 25_000n, 100_000n, 250_000n];

export const AgentView = () => {
  const { state, spend, formatAmount } = useAegis();
  const { ledger, counterparties } = state;
  const disabled = ledger.state !== AllowanceState.ACTIVE;

  const whitelisted = counterparties.filter((c) => c.whitelisted);
  const sanctioned = counterparties.filter((c) => !c.whitelisted);

  return (
    <Card accent="green" className="flex flex-col h-full">
      <CardHeader
        icon={<Bot className="w-4 h-4 text-shield-400" />}
        title="Agent"
        subtitle="LLM-driven trader operating under the principal's grant."
        badge={
          <Badge tone={disabled ? "neutral" : "green"}>
            {disabled ? "idle" : "online"}
          </Badge>
        }
      />

      <CardBody className="flex-1 flex flex-col gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Authorized spend
          </div>
          {disabled && (
            <div className="text-xs text-ink-500 mb-2 italic">
              Waiting for principal to create the allowance.
            </div>
          )}
          <div className="space-y-2.5">
            {whitelisted.map((c) => (
              <div
                key={c.id}
                className="rounded-md border border-shield-500/15 bg-shield-500/[0.04] p-2.5"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <div className="text-xs text-ink-100">{c.label}</div>
                    <div className="text-[10px] text-ink-500">{c.subLabel}</div>
                  </div>
                  <Badge tone="green">whitelisted</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      key={`${c.id}-${amount}`}
                      variant="success"
                      size="sm"
                      onClick={() => spend(c, amount)}
                      disabled={disabled}
                    >
                      {formatAmount(amount)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1.5">
            <ShieldOff className="w-3 h-3" /> Attempt to bypass policy
          </div>
          <div className="space-y-2.5">
            {sanctioned.map((c) => (
              <div
                key={c.id}
                className="rounded-md border border-danger-500/20 bg-danger-500/[0.04] p-2.5"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <div className="text-xs text-ink-100">{c.label}</div>
                    <div className="text-[10px] text-ink-500">{c.subLabel}</div>
                  </div>
                  <Badge tone="rose">blocked</Badge>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => spend(c, 1_000n)}
                  disabled={disabled}
                  className="w-full"
                >
                  Try to spend $10 → expect reject
                </Button>
              </div>
            ))}
            <div className="rounded-md border border-warn-500/20 bg-warn-500/[0.04] p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <div className="text-xs text-ink-100">Drain attack</div>
                  <div className="text-[10px] text-ink-500">Spend over the shielded cap</div>
                </div>
                <Badge tone="amber">over-limit</Badge>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => spend(whitelisted[0], 900_000n)}
                disabled={disabled}
                className="w-full"
              >
                Try to spend $9,000 → expect reject
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
