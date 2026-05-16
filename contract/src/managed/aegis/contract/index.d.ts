import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum AllowanceState { UNINITIALIZED = 0, ACTIVE = 1, REVOKED = 2 }

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  allowanceLimit(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  spendSoFar(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  whitelist(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array[]];
  recordSpend(context: __compactRuntime.WitnessContext<Ledger, PS>,
              amount_0: bigint): [PS, []];
}

export type ImpureCircuits<PS> = {
  createAllowance(context: __compactRuntime.CircuitContext<PS>,
                  newPrincipalPk_0: Uint8Array,
                  newAgentPk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  executeAgentTx(context: __compactRuntime.CircuitContext<PS>,
                 amount_0: bigint,
                 counterparty_0: Uint8Array,
                 nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeAllowance(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  createAllowance(context: __compactRuntime.CircuitContext<PS>,
                  newPrincipalPk_0: Uint8Array,
                  newAgentPk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  executeAgentTx(context: __compactRuntime.CircuitContext<PS>,
                 amount_0: bigint,
                 counterparty_0: Uint8Array,
                 nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeAllowance(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  publicKey(sk_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  publicKey(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  createAllowance(context: __compactRuntime.CircuitContext<PS>,
                  newPrincipalPk_0: Uint8Array,
                  newAgentPk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  executeAgentTx(context: __compactRuntime.CircuitContext<PS>,
                 amount_0: bigint,
                 counterparty_0: Uint8Array,
                 nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeAllowance(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly state: AllowanceState;
  readonly principalPk: Uint8Array;
  readonly agentPk: Uint8Array;
  readonly txCount: bigint;
  readonly lastTxCommitment: { is_some: boolean, value: Uint8Array };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
