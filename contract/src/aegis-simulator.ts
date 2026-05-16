// SPDX-License-Identifier: Apache-2.0
// Aegis: shielded allowances for AI agent wallets.

import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
} from "./managed/aegis/contract/index.js";
import { type AegisPrivateState, witnesses } from "./witnesses.js";

/**
 * Test harness for the Aegis contract.
 *
 * The simulator holds a single mutable circuit context so tests can drive the
 * contract through createAllowance / executeAgentTx / revokeAllowance without
 * spinning up a real proof server.
 */
export class AegisSimulator {
  readonly contract: Contract<AegisPrivateState>;
  circuitContext: CircuitContext<AegisPrivateState>;

  constructor(initialState: AegisPrivateState) {
    this.contract = new Contract<AegisPrivateState>(witnesses);
    const { currentPrivateState, currentContractState, currentZswapLocalState } =
      this.contract.initialState(
        createConstructorContext(initialState, "0".repeat(64)),
      );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  public switchRole(role: "principal" | "agent"): void {
    this.circuitContext.currentPrivateState = {
      ...this.circuitContext.currentPrivateState,
      currentRole: role,
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): AegisPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public principalPublicKey(): Uint8Array {
    return this.contract.circuits.publicKey(
      this.circuitContext,
      this.getPrivateState().principalSecretKey,
    ).result;
  }

  public agentPublicKey(): Uint8Array {
    return this.contract.circuits.publicKey(
      this.circuitContext,
      this.getPrivateState().agentSecretKey,
    ).result;
  }

  public createAllowance(): Ledger {
    this.switchRole("principal");
    this.circuitContext = this.contract.impureCircuits.createAllowance(
      this.circuitContext,
      this.principalPublicKey(),
      this.agentPublicKey(),
    ).context;
    return this.getLedger();
  }

  public executeAgentTx(
    amount: bigint,
    counterparty: Uint8Array,
    nonce: Uint8Array,
  ): Ledger {
    this.switchRole("agent");
    this.circuitContext = this.contract.impureCircuits.executeAgentTx(
      this.circuitContext,
      amount,
      counterparty,
      nonce,
    ).context;
    return this.getLedger();
  }

  public revokeAllowance(): Ledger {
    this.switchRole("principal");
    this.circuitContext = this.contract.impureCircuits.revokeAllowance(
      this.circuitContext,
    ).context;
    return this.getLedger();
  }
}
