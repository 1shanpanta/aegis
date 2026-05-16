// SPDX-License-Identifier: Apache-2.0
// Aegis: shielded allowances for AI agent wallets.

import { Ledger } from "./managed/aegis/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

/**
 * The private state for an Aegis allowance.
 *
 * A single contract instance is interacted with by two distinct roles:
 *  - the principal who creates and revokes the allowance
 *  - the agent who spends within the allowance
 *
 * Both roles keep their secret keys client-side. The principal also
 * holds the shielded allowance terms (limit, whitelist) and the running
 * spend total. In a real deployment the principal would encrypt these
 * terms to the agent's key when granting the allowance. For the demo
 * we keep both in the same browser private state and toggle `currentRole`.
 */
export type AegisPrivateState = {
  readonly principalSecretKey: Uint8Array;
  readonly agentSecretKey: Uint8Array;
  readonly currentRole: "principal" | "agent";
  readonly allowanceLimit: bigint;
  readonly spendSoFar: bigint;
  readonly whitelist: Uint8Array[];
  readonly auditLog: AuditEntry[];
};

export type AuditEntry = {
  readonly amount: bigint;
  readonly counterparty: Uint8Array;
  readonly nonce: Uint8Array;
  readonly timestamp: number;
};

export const createAegisPrivateState = (params: {
  principalSecretKey: Uint8Array;
  agentSecretKey: Uint8Array;
  allowanceLimit: bigint;
  whitelist: Uint8Array[];
}): AegisPrivateState => ({
  principalSecretKey: params.principalSecretKey,
  agentSecretKey: params.agentSecretKey,
  currentRole: "principal",
  allowanceLimit: params.allowanceLimit,
  spendSoFar: 0n,
  whitelist: params.whitelist,
  auditLog: [],
});

/**
 * Witness implementations. Each returns [newPrivateState, returnValue].
 * Only `recordSpend` mutates state; the readers return the existing state unchanged.
 */
export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, AegisPrivateState>): [
    AegisPrivateState,
    Uint8Array,
  ] => [
    privateState,
    privateState.currentRole === "principal"
      ? privateState.principalSecretKey
      : privateState.agentSecretKey,
  ],

  allowanceLimit: ({
    privateState,
  }: WitnessContext<Ledger, AegisPrivateState>): [AegisPrivateState, bigint] => [
    privateState,
    privateState.allowanceLimit,
  ],

  spendSoFar: ({
    privateState,
  }: WitnessContext<Ledger, AegisPrivateState>): [AegisPrivateState, bigint] => [
    privateState,
    privateState.spendSoFar,
  ],

  whitelist: ({
    privateState,
  }: WitnessContext<Ledger, AegisPrivateState>): [
    AegisPrivateState,
    Uint8Array[],
  ] => [privateState, privateState.whitelist],

  recordSpend: (
    { privateState }: WitnessContext<Ledger, AegisPrivateState>,
    amount: bigint,
  ): [AegisPrivateState, []] => [
    {
      ...privateState,
      spendSoFar: privateState.spendSoFar + amount,
    },
    [],
  ],
};
