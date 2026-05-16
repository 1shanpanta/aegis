// SPDX-License-Identifier: Apache-2.0
import { useAegis, AllowanceState } from "../lib/aegis-engine";
import { Card, CardHeader, CardBody, CardSection } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { shortHex } from "../lib/utils";

const stateLabel: Record<AllowanceState, string> = {
  [AllowanceState.UNINITIALIZED]: "uninitialized",
  [AllowanceState.ACTIVE]: "active",
  [AllowanceState.REVOKED]: "revoked",
};

export const PublicView = () => {
  const { state } = useAegis();
  const { ledger } = state;

  const ledgerRows: { label: string; value: React.ReactNode }[] = [
    { label: "state", value: stateLabel[ledger.state] },
    { label: "principalPk", value: shortHex(ledger.principalPk, 8, 6) },
    { label: "agentPk", value: shortHex(ledger.agentPk, 8, 6) },
    { label: "txCount", value: ledger.txCount.toString() },
    {
      label: "lastTxCommitment",
      value: ledger.lastTxCommitment.is_some
        ? shortHex(ledger.lastTxCommitment.value, 10, 6)
        : "none",
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
    <Card>
      <CardHeader
        title="Public chain"
        subtitle="What every outsider sees on Midnight."
        trailing={<Badge tone="muted">on-chain</Badge>}
      />

      <CardBody className="space-y-0">
        <CardSection label="Ledger fields · visible">
          <dl className="font-mono text-[12px] divide-y divide-ink-800/60">
            {ledgerRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5">
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
          <p className="text-[12px] leading-relaxed text-ink-400 max-w-[34ch]">
            The chain proves an allowance is active and N spends happened. Brute-force preimage on
            a 256-bit nonce is infeasible.
          </p>
        </CardSection>
      </CardBody>
    </Card>
  );
};
