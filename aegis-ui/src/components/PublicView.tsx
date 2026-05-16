// SPDX-License-Identifier: Apache-2.0
import { Globe, Hash, FileLock } from "lucide-react";
import { useAegis, AllowanceState } from "../lib/aegis-engine";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { shortHex } from "../lib/utils";

const stateLabel: Record<AllowanceState, string> = {
  [AllowanceState.UNINITIALIZED]: "Uninitialized",
  [AllowanceState.ACTIVE]: "Active",
  [AllowanceState.REVOKED]: "Revoked",
};

export const PublicView = () => {
  const { state } = useAegis();
  const { ledger } = state;

  const rows: Array<{ label: string; value: React.ReactNode; isPrivate?: boolean }> = [
    { label: "state", value: stateLabel[ledger.state] },
    { label: "principalPk", value: shortHex(ledger.principalPk, 8, 6) },
    { label: "agentPk", value: shortHex(ledger.agentPk, 8, 6) },
    { label: "txCount", value: ledger.txCount.toString() },
    {
      label: "lastTxCommitment",
      value: ledger.lastTxCommitment.is_some ? (
        <span className="text-ink-100">{shortHex(ledger.lastTxCommitment.value, 10, 6)}</span>
      ) : (
        <span className="text-ink-500 italic">none</span>
      ),
    },
  ];

  const hidden: Array<{ label: string; reason: string }> = [
    { label: "allowance limit", reason: "private witness" },
    { label: "amounts per tx", reason: "hashed into commitment" },
    { label: "counterparty per tx", reason: "hashed into commitment" },
    { label: "running spend", reason: "private witness" },
    { label: "whitelist", reason: "private witness" },
  ];

  return (
    <Card accent="amber" className="flex flex-col h-full">
      <CardHeader
        icon={<Globe className="w-4 h-4 text-warn-400" />}
        title="Public chain"
        subtitle="What every outsider sees on Midnight."
        badge={<Badge tone="amber">on-chain</Badge>}
      />

      <CardBody className="flex-1 flex flex-col gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1.5">
            <Hash className="w-3 h-3" /> Ledger fields
          </div>
          <div className="rounded-lg border border-ink-700/60 bg-ink-800/40 divide-y divide-ink-700/40 font-mono text-xs">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2">
                <span className="text-ink-400">{row.label}</span>
                <span className="text-ink-100 truncate ml-3 max-w-[60%] text-right">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1.5">
            <FileLock className="w-3 h-3" /> Cryptographically hidden
          </div>
          <div className="rounded-lg border border-ink-700/40 bg-ink-900/50 divide-y divide-ink-800/60 text-xs">
            {hidden.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2">
                <span className="text-ink-300">{row.label}</span>
                <span className="text-[10px] text-ink-500">{row.reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-warn-500/20 bg-warn-500/[0.05] p-3 text-xs leading-relaxed text-ink-300 mt-auto">
          <div className="font-medium text-warn-400 mb-1 uppercase tracking-wider text-[10px]">
            Outsider verdict
          </div>
          The chain proves an allowance is active and N spends happened, but the limit, amounts,
          and counterparties are bound only inside the commitment. Brute-force preimage attack on
          a 256-bit nonce is infeasible.
        </div>
      </CardBody>
    </Card>
  );
};
