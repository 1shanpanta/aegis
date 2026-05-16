// SPDX-License-Identifier: Apache-2.0
import { Globe } from "lucide-react";
import { useAegis, AllowanceState } from "../lib/aegis-engine";
import { Card, CardHeader, CardBody, CardSection } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { shortHex } from "../lib/utils";

const stateLabel: Record<AllowanceState, string> = {
  [AllowanceState.UNINITIALIZED]: "uninitialized",
  [AllowanceState.ACTIVE]: "active",
  [AllowanceState.REVOKED]: "revoked",
};

const isZeroBytes = (b: Uint8Array): boolean => {
  for (let i = 0; i < b.length; i++) if (b[i] !== 0) return false;
  return true;
};

const renderHex = (b: Uint8Array | undefined): React.ReactNode => {
  if (!b || isZeroBytes(b)) return <span className="text-ink-700">—</span>;
  return shortHex(b, 8, 6);
};

export const PublicView = () => {
  const { state } = useAegis();
  const { ledger } = state;
  const isActive = ledger.state === AllowanceState.ACTIVE;

  const ledgerRows: { label: string; value: React.ReactNode }[] = [
    {
      label: "state",
      value: (
        <span
          className={
            ledger.state === AllowanceState.ACTIVE
              ? "text-accent-300"
              : ledger.state === AllowanceState.REVOKED
              ? "text-ink-500"
              : "text-ink-100"
          }
        >
          {stateLabel[ledger.state]}
        </span>
      ),
    },
    { label: "principalPk", value: renderHex(ledger.principalPk) },
    { label: "agentPk", value: renderHex(ledger.agentPk) },
    { label: "txCount", value: ledger.txCount.toString() },
    {
      label: "lastTxCommitment",
      value: ledger.lastTxCommitment.is_some ? (
        shortHex(ledger.lastTxCommitment.value, 10, 6)
      ) : (
        <span className="text-ink-700">—</span>
      ),
    },
  ];

  const hidden: { label: string; reason: string }[] = [
    { label: "allowance limit", reason: "private witness" },
    { label: "amounts per tx", reason: "hashed into commitment" },
    { label: "counterparty per tx", reason: "hashed into commitment" },
    { label: "running spend", reason: "private witness" },
    { label: "whitelist", reason: "private witness" },
  ];

  return (
    <Card active={isActive}>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-accent-300" />
            Public chain
          </span>
        }
        subtitle="What every outsider sees on Midnight."
        trailing={<Badge tone="muted">on-chain</Badge>}
      />

      <CardBody className="space-y-0">
        <CardSection label="Ledger fields · visible">
          <dl className="font-mono text-[12px] divide-y divide-ink-800/60">
            {ledgerRows.map((row, i) => (
              <div
                key={row.label}
                className={
                  "flex items-center justify-between py-2.5 px-2 -mx-2 rounded-md " +
                  (i % 2 === 1 ? "bg-ink-900/20" : "")
                }
              >
                <dt className="text-ink-500">{row.label}</dt>
                <dd className="text-ink-100 tabular-nums truncate ml-3 max-w-[60%] text-right">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardSection>

        <CardSection label="Hidden · cryptographic">
          <dl className="text-[12px] divide-y divide-ink-800/60">
            {hidden.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5">
                <dt className="text-ink-300">{row.label}</dt>
                <dd className="text-[11px] text-ink-500 font-mono">{row.reason}</dd>
              </div>
            ))}
          </dl>
        </CardSection>

        <CardSection>
          <p
            className="text-[12px] leading-relaxed text-ink-400 max-w-[34ch]"
            style={{ textWrap: "pretty" } as React.CSSProperties}
          >
            The chain proves an allowance is active and N spends happened. Brute-force preimage on
            a 256-bit nonce is infeasible.
          </p>
        </CardSection>
      </CardBody>
    </Card>
  );
};
