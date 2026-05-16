// SPDX-License-Identifier: Apache-2.0
//
// Aegis engine: wraps the in-browser AegisSimulator and exposes a small
// React-friendly subscription API. The same Compact contract that deploys
// to Midnight mainnet runs here in a deterministic local context so the demo
// can stress-test every reject path without a proof server or wallet.

import { useSyncExternalStore } from "react";
import {
  AegisSimulator,
  AllowanceState,
  createAegisPrivateState,
  type AegisPrivateState,
  type AuditEntry,
  type Ledger,
} from "@aegis/contract";

export type Counterparty = {
  readonly id: "uniswap" | "aave" | "1inch" | "tornado" | "sanctioned";
  readonly label: string;
  readonly subLabel: string;
  readonly address: Uint8Array;
  readonly whitelisted: boolean;
};

const randomBytes = (length: number): Uint8Array => {
  const out = new Uint8Array(length);
  crypto.getRandomValues(out);
  return out;
};

const seedAddress = (seed: string): Uint8Array => {
  const bytes = new TextEncoder().encode(seed);
  const out = new Uint8Array(32);
  out.set(bytes.subarray(0, 32));
  return out;
};

export type AegisEvent =
  | { kind: "info"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export type AegisState = {
  readonly ledger: Ledger;
  readonly privateState: AegisPrivateState;
  readonly auditLog: AuditEntry[];
  readonly events: AegisEvent[];
  readonly counterparties: Counterparty[];
};

class AegisEngine {
  private simulator!: AegisSimulator;
  private listeners = new Set<() => void>();
  private snapshot: AegisState;
  readonly counterparties: Counterparty[];
  readonly initialLimit = 500_000n; // $5,000.00 in cents

  constructor() {
    this.counterparties = [
      {
        id: "uniswap",
        label: "Uniswap V4",
        subLabel: "DEX router",
        address: seedAddress("uniswap-v4-router-mainnet-counterparty"),
        whitelisted: true,
      },
      {
        id: "aave",
        label: "Aave V3 Pool",
        subLabel: "Lending market",
        address: seedAddress("aave-v3-pool-mainnet-counterparty"),
        whitelisted: true,
      },
      {
        id: "1inch",
        label: "1inch Aggregator",
        subLabel: "Aggregated router",
        address: seedAddress("1inch-aggregator-mainnet-counterparty"),
        whitelisted: true,
      },
      {
        id: "tornado",
        label: "Tornado Cash",
        subLabel: "OFAC sanctioned",
        address: seedAddress("tornado-cash-sanctioned-counterparty-0xff"),
        whitelisted: false,
      },
      {
        id: "sanctioned",
        label: "0xBADB0T LLC",
        subLabel: "Unknown actor",
        address: seedAddress("unknown-bad-actor-counterparty-rugpull-x"),
        whitelisted: false,
      },
    ];
    this.reset();
    this.snapshot = this.takeSnapshot();
  }

  reset(): void {
    const whitelist = this.counterparties
      .filter((c) => c.whitelisted)
      .map((c) => c.address);
    const initialState = createAegisPrivateState({
      principalSecretKey: randomBytes(32),
      agentSecretKey: randomBytes(32),
      allowanceLimit: this.initialLimit,
      whitelist,
    });
    this.simulator = new AegisSimulator(initialState);
    this.snapshot = this.takeSnapshot([
      { kind: "info", message: "Aegis ready. Allowance not yet created." },
    ]);
    this.emit();
  }

  createAllowance(): void {
    try {
      this.simulator.createAllowance();
      this.snapshot = this.takeSnapshot([
        ...this.snapshot.events,
        {
          kind: "success",
          message: `Allowance created. Limit ${this.formatLimit()} shielded; whitelist (${this.snapshot.counterparties.filter((c) => c.whitelisted).length} counterparties) shielded.`,
        },
      ]);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.emit();
    }
  }

  spend(counterparty: Counterparty, amount: bigint): void {
    try {
      const nonce = randomBytes(32);
      const before = this.simulator.getPrivateState().spendSoFar;
      this.simulator.executeAgentTx(amount, counterparty.address, nonce);
      const after = this.simulator.getPrivateState().spendSoFar;
      // append to audit log
      const newLog: AuditEntry = {
        amount,
        counterparty: counterparty.address,
        nonce,
        timestamp: Date.now(),
      };
      this.simulator.circuitContext.currentPrivateState = {
        ...this.simulator.getPrivateState(),
        auditLog: [...this.simulator.getPrivateState().auditLog, newLog],
      };
      this.snapshot = this.takeSnapshot([
        ...this.snapshot.events,
        {
          kind: "success",
          message: `Agent spent ${this.formatAmount(amount)} → ${counterparty.label}. Spend so far: ${this.formatAmount(after)} (was ${this.formatAmount(before)}).`,
        },
      ]);
    } catch (error) {
      this.handleError(error, `attempted spend → ${counterparty.label}`);
    } finally {
      this.emit();
    }
  }

  revoke(): void {
    try {
      this.simulator.revokeAllowance();
      this.snapshot = this.takeSnapshot([
        ...this.snapshot.events,
        { kind: "info", message: "Allowance revoked by principal. Agent can no longer spend." },
      ]);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.emit();
    }
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): AegisState => this.snapshot;

  private emit() {
    for (const listener of this.listeners) listener();
  }

  private takeSnapshot(events?: AegisEvent[]): AegisState {
    return {
      ledger: this.simulator.getLedger(),
      privateState: this.simulator.getPrivateState(),
      auditLog: this.simulator.getPrivateState().auditLog,
      events: events ?? this.snapshot?.events ?? [],
      counterparties: this.counterparties,
    };
  }

  private handleError(error: unknown, prefix?: string): void {
    const message = error instanceof Error ? error.message : String(error);
    // Extract "failed assert: …" if present
    const m = /failed assert: (.+)/.exec(message);
    const reason = m?.[1] ?? message;
    this.snapshot = this.takeSnapshot([
      ...this.snapshot.events,
      { kind: "error", message: prefix ? `Rejected (${prefix}): ${reason}` : `Rejected: ${reason}` },
    ]);
  }

  private formatLimit(): string {
    return this.formatAmount(this.initialLimit);
  }

  formatAmount(cents: bigint): string {
    const sign = cents < 0n ? "-" : "";
    const abs = cents < 0n ? -cents : cents;
    const dollars = Number(abs) / 100;
    return `${sign}$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(dollars)}`;
  }
}

const engine = new AegisEngine();

export const useAegis = (): {
  state: AegisState;
  createAllowance: () => void;
  spend: (counterparty: Counterparty, amount: bigint) => void;
  revoke: () => void;
  reset: () => void;
  formatAmount: (cents: bigint) => string;
} => {
  const state = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  return {
    state,
    createAllowance: () => engine.createAllowance(),
    spend: (c, a) => engine.spend(c, a),
    revoke: () => engine.revoke(),
    reset: () => engine.reset(),
    formatAmount: (c) => engine.formatAmount(c),
  };
};

export { AllowanceState };
