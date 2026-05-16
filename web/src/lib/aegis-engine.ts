// SPDX-License-Identifier: Apache-2.0
//
// Aegis engine: drives the same UI from two backends.
//
//   simulator (default) — runs the Compact circuits in-browser via
//                         AegisSimulator. Synchronous. Deterministic.
//                         No wallet, no proof server, no network.
//
//   live (preprod)     — routes calls through deployAegisOnChain /
//                         findDeployedContract. Async. Lace signs,
//                         the local proof server proves, the indexer reads.
//
// The engine keeps a single AegisState shape regardless of mode so the
// PrincipalView / AgentView / PublicView components don't need to branch.

import { useSyncExternalStore } from "react";
import {
  AegisSimulator,
  AllowanceState,
  createAegisPrivateState,
  type AegisPrivateState,
  type AuditEntry,
  type Ledger,
} from "@aegis/contract";
import type { Mode } from "./use-mode";
import {
  startLive,
  callCreateAllowance,
  callExecuteAgentTx,
  callRevokeAllowance,
  readLiveLedger,
  type LiveDeployment,
} from "./live-engine";

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

export type LiveStatus =
  | { kind: "off" }
  | { kind: "connecting"; message: string }
  | { kind: "ready"; contractAddress: string }
  | { kind: "pending"; action: string }
  | { kind: "error"; message: string };

export type AegisState = {
  readonly ledger: Ledger;
  readonly privateState: AegisPrivateState;
  readonly auditLog: AuditEntry[];
  readonly events: AegisEvent[];
  readonly counterparties: Counterparty[];
  readonly mode: Mode;
  readonly liveStatus: LiveStatus;
};

class AegisEngine {
  private simulator!: AegisSimulator;
  private liveDeployment: LiveDeployment | null = null;
  private listeners = new Set<() => void>();
  private snapshot!: AegisState;
  private mode: Mode = "simulator";
  private liveStatus: LiveStatus = { kind: "off" };

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
  }

  setMode(next: Mode): void {
    if (this.mode === next) return;
    this.mode = next;
    if (next === "simulator") {
      this.liveDeployment = null;
      this.liveStatus = { kind: "off" };
    }
    this.snapshot = this.takeSnapshot([
      ...this.snapshot.events,
      {
        kind: "info",
        message:
          next === "live"
            ? "Switched to live mode. Click Create allowance to connect Lace and deploy."
            : "Switched to simulator mode. Local circuits, no chain.",
      },
    ]);
    this.emit();
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
    this.liveDeployment = null;
    this.liveStatus = this.mode === "live" ? { kind: "off" } : { kind: "off" };
    this.snapshot = this.takeSnapshot([
      { kind: "info", message: "Aegis ready. Allowance not yet created." },
    ]);
    this.emit();
  }

  // ---------------------------------------------------------------------- //
  // Public actions. Each one routes through the simulator OR the live      //
  // adapter based on this.mode. Live actions are async; we surface phase   //
  // changes via this.liveStatus so the UI can render a "pending" badge.    //
  // ---------------------------------------------------------------------- //

  async createAllowance(): Promise<void> {
    if (this.mode === "simulator") {
      this.simulatorCreateAllowance();
      return;
    }
    await this.liveCreateAllowance();
  }

  async spend(counterparty: Counterparty, amount: bigint): Promise<void> {
    if (this.mode === "simulator") {
      this.simulatorSpend(counterparty, amount);
      return;
    }
    await this.liveSpend(counterparty, amount);
  }

  async revoke(): Promise<void> {
    if (this.mode === "simulator") {
      this.simulatorRevoke();
      return;
    }
    await this.liveRevoke();
  }

  // ---------------------------------------------------------------------- //
  // Simulator path. Synchronous. Always available.                          //
  // ---------------------------------------------------------------------- //

  private simulatorCreateAllowance(): void {
    try {
      this.simulator.createAllowance();
      this.snapshot = this.takeSnapshot([
        ...this.snapshot.events,
        {
          kind: "success",
          message: `Allowance created. Limit ${this.formatLimit()} shielded; whitelist (${this.counterparties.filter((c) => c.whitelisted).length} counterparties) shielded.`,
        },
      ]);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.emit();
    }
  }

  private simulatorSpend(counterparty: Counterparty, amount: bigint): void {
    try {
      const nonce = randomBytes(32);
      const before = this.simulator.getPrivateState().spendSoFar;
      this.simulator.executeAgentTx(amount, counterparty.address, nonce);
      const after = this.simulator.getPrivateState().spendSoFar;
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

  private simulatorRevoke(): void {
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

  // ---------------------------------------------------------------------- //
  // Live path. Async. Goes through Lace + proof server + indexer.          //
  // ---------------------------------------------------------------------- //

  private async ensureLiveDeployment(): Promise<LiveDeployment> {
    if (this.liveDeployment) return this.liveDeployment;
    this.liveStatus = { kind: "connecting", message: "Connecting Lace, building providers…" };
    this.snapshot = this.takeSnapshot([
      ...this.snapshot.events,
      { kind: "info", message: "Connecting Lace + proof server…" },
    ]);
    this.emit();

    const deployment = await startLive(this.simulator.getPrivateState());
    this.liveDeployment = deployment;
    this.liveStatus = { kind: "ready", contractAddress: deployment.contractAddress };
    this.snapshot = this.takeSnapshot([
      ...this.snapshot.events,
      {
        kind: "success",
        message: `Connected. Aegis contract ${this.shortAddr(deployment.contractAddress)} ready.`,
      },
    ]);
    this.emit();
    return deployment;
  }

  private async liveCreateAllowance(): Promise<void> {
    try {
      const deployment = await this.ensureLiveDeployment();
      this.liveStatus = { kind: "pending", action: "createAllowance" };
      this.emit();

      // Derive principal + agent pubkeys from the simulator's witness state.
      const principalPk = this.simulator.principalPublicKey();
      const agentPk = this.simulator.agentPublicKey();
      await callCreateAllowance(deployment, principalPk, agentPk);
      await this.refreshLiveLedger(deployment);

      this.liveStatus = { kind: "ready", contractAddress: deployment.contractAddress };
      this.snapshot = this.takeSnapshot([
        ...this.snapshot.events,
        {
          kind: "success",
          message: `On-chain allowance active at ${this.shortAddr(deployment.contractAddress)}.`,
        },
      ]);
    } catch (error) {
      this.handleLiveError(error, "createAllowance");
    } finally {
      this.emit();
    }
  }

  private async liveSpend(counterparty: Counterparty, amount: bigint): Promise<void> {
    if (!this.liveDeployment) {
      this.snapshot = this.takeSnapshot([
        ...this.snapshot.events,
        { kind: "error", message: "Create an allowance first before spending in live mode." },
      ]);
      this.emit();
      return;
    }
    try {
      this.liveStatus = { kind: "pending", action: "executeAgentTx" };
      this.emit();

      const nonce = randomBytes(32);
      const before = this.simulator.getPrivateState().spendSoFar;

      // Local mirror: run the simulator first so witnesses + audit log stay
      // in lockstep. If the circuit rejects locally we never spend a real tx.
      this.simulator.executeAgentTx(amount, counterparty.address, nonce);

      await callExecuteAgentTx(this.liveDeployment, amount, counterparty.address, nonce);
      await this.refreshLiveLedger(this.liveDeployment);

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
      const after = this.simulator.getPrivateState().spendSoFar;

      this.liveStatus = {
        kind: "ready",
        contractAddress: this.liveDeployment.contractAddress,
      };
      this.snapshot = this.takeSnapshot([
        ...this.snapshot.events,
        {
          kind: "success",
          message: `Live tx: ${this.formatAmount(amount)} → ${counterparty.label}. Spend so far ${this.formatAmount(after)} (was ${this.formatAmount(before)}).`,
        },
      ]);
    } catch (error) {
      this.handleLiveError(error, `executeAgentTx → ${counterparty.label}`);
    } finally {
      this.emit();
    }
  }

  private async liveRevoke(): Promise<void> {
    if (!this.liveDeployment) {
      this.snapshot = this.takeSnapshot([
        ...this.snapshot.events,
        { kind: "error", message: "No live allowance to revoke." },
      ]);
      this.emit();
      return;
    }
    try {
      this.liveStatus = { kind: "pending", action: "revokeAllowance" };
      this.emit();
      this.simulator.revokeAllowance();
      await callRevokeAllowance(this.liveDeployment);
      await this.refreshLiveLedger(this.liveDeployment);
      this.liveStatus = {
        kind: "ready",
        contractAddress: this.liveDeployment.contractAddress,
      };
      this.snapshot = this.takeSnapshot([
        ...this.snapshot.events,
        { kind: "info", message: "Revoke broadcast. Allowance now REVOKED on-chain." },
      ]);
    } catch (error) {
      this.handleLiveError(error, "revokeAllowance");
    } finally {
      this.emit();
    }
  }

  private async refreshLiveLedger(deployment: LiveDeployment): Promise<void> {
    try {
      const fresh = await readLiveLedger(deployment);
      // Swap the simulator's "public" view for the chain's. Private state
      // continues to live in the simulator and only updates after each circuit
      // call. We accept the indexer's view of state, txCount, lastTxCommitment.
      this.snapshot = {
        ...this.snapshot,
        ledger: fresh,
      };
    } catch (e) {
      // Indexer hiccup — fall back to the simulator's local view so the UI
      // doesn't go blank. The next successful tx will refresh.
      console.warn("indexer fetch failed, using local view", e);
    }
  }

  // ---------------------------------------------------------------------- //
  // Errors                                                                  //
  // ---------------------------------------------------------------------- //

  private handleError(error: unknown, prefix?: string): void {
    const message = error instanceof Error ? error.message : String(error);
    const m = /failed assert: (.+)/.exec(message);
    const reason = m?.[1] ?? message;
    this.snapshot = this.takeSnapshot([
      ...this.snapshot.events,
      { kind: "error", message: prefix ? `Rejected (${prefix}): ${reason}` : `Rejected: ${reason}` },
    ]);
  }

  private handleLiveError(error: unknown, where: string): void {
    const message = error instanceof Error ? error.message : String(error);
    const m = /failed assert: (.+)/.exec(message);
    const reason = m?.[1] ?? message;
    this.liveStatus = { kind: "error", message: reason };
    this.snapshot = this.takeSnapshot([
      ...this.snapshot.events,
      { kind: "error", message: `Live ${where} failed: ${reason}` },
    ]);
  }

  // ---------------------------------------------------------------------- //
  // Plumbing                                                                //
  // ---------------------------------------------------------------------- //

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
      ledger: this.snapshot?.ledger ?? this.simulator.getLedger(),
      privateState: this.simulator.getPrivateState(),
      auditLog: this.simulator.getPrivateState().auditLog,
      events: events ?? this.snapshot?.events ?? [],
      counterparties: this.counterparties,
      mode: this.mode,
      liveStatus: this.liveStatus,
    };
  }

  // The base snapshot uses the simulator's ledger; live-mode refresh swaps it.
  // We override the takeSnapshot to ensure the simulator-mode snapshot is
  // always fresh from the simulator (otherwise stale post-mode-switch).
  private freshSnapshot(events?: AegisEvent[]): AegisState {
    return {
      ledger: this.simulator.getLedger(),
      privateState: this.simulator.getPrivateState(),
      auditLog: this.simulator.getPrivateState().auditLog,
      events: events ?? this.snapshot?.events ?? [],
      counterparties: this.counterparties,
      mode: this.mode,
      liveStatus: this.liveStatus,
    };
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

  private shortAddr(addr: string, head = 8, tail = 6): string {
    if (!addr) return "—";
    if (addr.length <= head + tail + 1) return addr;
    return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
  }
}

const engine = new AegisEngine();

export const useAegis = (): {
  state: AegisState;
  createAllowance: () => Promise<void>;
  spend: (counterparty: Counterparty, amount: bigint) => Promise<void>;
  revoke: () => Promise<void>;
  reset: () => void;
  setMode: (m: Mode) => void;
  formatAmount: (cents: bigint) => string;
} => {
  const state = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  return {
    state,
    createAllowance: () => engine.createAllowance(),
    spend: (c, a) => engine.spend(c, a),
    revoke: () => engine.revoke(),
    reset: () => engine.reset(),
    setMode: (m) => engine.setMode(m),
    formatAmount: (c) => engine.formatAmount(c),
  };
};

export { AllowanceState };
