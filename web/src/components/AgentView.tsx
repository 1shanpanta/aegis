// SPDX-License-Identifier: Apache-2.0
import { useAegis, AllowanceState } from "../lib/aegis-engine";
import { Card, CardHeader, CardBody, CardSection } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge, Dot } from "./ui/Badge";

const QUICK_AMOUNTS: bigint[] = [5_000n, 25_000n, 100_000n, 250_000n];

export const AgentView = () => {
  const { state, spend, formatAmount } = useAegis();
  const { ledger, counterparties } = state;
  const idle = ledger.state !== AllowanceState.ACTIVE;
  const whitelisted = counterparties.filter((c) => c.whitelisted);
  const sanctioned = counterparties.filter((c) => !c.whitelisted);

  return (
    <Card>
      <CardHeader
        title="Agent"
        subtitle="LLM-driven trader operating under the principal's grant."
        trailing={
          <Badge tone={idle ? "muted" : "active"}>{idle ? "idle" : "online"}</Badge>
        }
      />

      <CardBody className="space-y-0">
        <CardSection label="Authorized spend">
          {idle && (
            <div className="text-[13px] text-ink-500 italic mb-4">
              Waiting for principal to create the allowance.
            </div>
          )}
          <div className="space-y-5">
            {whitelisted.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <Dot tone="active" />
                    <span className="text-[14px] text-ink-100">{c.label}</span>
                  </div>
                  <span className="text-[11px] text-ink-500">{c.subLabel}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {QUICK_AMOUNTS.map((amount) => (
                    <button
                      key={`${c.id}-${amount}`}
                      onClick={() => spend(c, amount)}
                      disabled={idle}
                      className="text-[12px] font-mono tabular-nums py-2 rounded-md border border-ink-800 text-ink-200 hover:border-accent-500/40 hover:text-accent-200 hover:bg-accent-500/[0.04] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-ink-800 disabled:hover:text-ink-200 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                    >
                      {formatAmount(amount)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardSection>

        <CardSection label="Attack tests · expect reject">
          <div className="space-y-2.5">
            {sanctioned.map((c) => (
              <Button
                key={c.id}
                variant="secondary"
                size="sm"
                onClick={() => spend(c, 1_000n)}
                disabled={idle}
                className="w-full justify-between text-left"
              >
                <span className="flex items-center gap-2.5">
                  <Dot tone="muted" />
                  <span>{c.label}</span>
                </span>
                <span className="text-[11px] text-ink-500">$10 → reject</span>
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => spend(whitelisted[0], 900_000n)}
              disabled={idle}
              className="w-full justify-between text-left"
            >
              <span className="flex items-center gap-2.5">
                <Dot tone="muted" />
                <span>Drain attempt</span>
              </span>
              <span className="text-[11px] text-ink-500">$9,000 → over cap</span>
            </Button>
          </div>
        </CardSection>
      </CardBody>
    </Card>
  );
};
