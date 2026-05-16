// SPDX-License-Identifier: Apache-2.0
// Aegis: shielded allowances for AI agent wallets.

import { AegisSimulator } from "../aegis-simulator.js";
import {
  NetworkId,
  setNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";
import { AllowanceState } from "../managed/aegis/contract/index.js";
import { createAegisPrivateState } from "../witnesses.js";

setNetworkId("undeployed" as NetworkId);

const setup = (overrides: Partial<{ limit: bigint }> = {}) => {
  const whitelist = [randomBytes(32), randomBytes(32), randomBytes(32)];
  const initialState = createAegisPrivateState({
    principalSecretKey: randomBytes(32),
    agentSecretKey: randomBytes(32),
    allowanceLimit: overrides.limit ?? 1000n,
    whitelist,
  });
  return { sim: new AegisSimulator(initialState), whitelist };
};

describe("Aegis allowance contract", () => {
  it("initializes in UNINITIALIZED state with empty commitment", () => {
    const { sim } = setup();
    const ledger = sim.getLedger();
    expect(ledger.state).toEqual(AllowanceState.UNINITIALIZED);
    expect(ledger.lastTxCommitment.is_some).toEqual(false);
    expect(ledger.txCount).toEqual(0n);
  });

  it("createAllowance moves to ACTIVE and records principal + agent keys", () => {
    const { sim } = setup();
    const ledger = sim.createAllowance();
    expect(ledger.state).toEqual(AllowanceState.ACTIVE);
    expect(ledger.principalPk).toEqual(sim.principalPublicKey());
    expect(ledger.agentPk).toEqual(sim.agentPublicKey());
  });

  it("allows the agent to spend within the allowance and emits commitments", () => {
    const { sim, whitelist } = setup({ limit: 1000n });
    sim.createAllowance();

    sim.executeAgentTx(300n, whitelist[0], randomBytes(32));
    let ledger = sim.getLedger();
    expect(ledger.txCount).toEqual(1n);
    expect(ledger.lastTxCommitment.is_some).toEqual(true);
    const firstCommitment = ledger.lastTxCommitment.value;

    sim.executeAgentTx(400n, whitelist[1], randomBytes(32));
    ledger = sim.getLedger();
    expect(ledger.txCount).toEqual(2n);
    expect(ledger.lastTxCommitment.value).not.toEqual(firstCommitment);

    // Private state should track running total
    expect(sim.getPrivateState().spendSoFar).toEqual(700n);
  });

  it("rejects spend that would exceed the allowance", () => {
    const { sim, whitelist } = setup({ limit: 1000n });
    sim.createAllowance();
    sim.executeAgentTx(700n, whitelist[0], randomBytes(32));

    expect(() =>
      sim.executeAgentTx(400n, whitelist[1], randomBytes(32)),
    ).toThrow(/Spend exceeds allowance/);
  });

  it("rejects counterparty not in the whitelist", () => {
    const { sim } = setup();
    sim.createAllowance();
    const sanctioned = randomBytes(32);
    expect(() =>
      sim.executeAgentTx(50n, sanctioned, randomBytes(32)),
    ).toThrow(/Counterparty not whitelisted/);
  });

  it("rejects agent spending before allowance is created", () => {
    const { sim, whitelist } = setup();
    expect(() =>
      sim.executeAgentTx(50n, whitelist[0], randomBytes(32)),
    ).toThrow(/Allowance not active/);
  });

  it("revokeAllowance halts further spending", () => {
    const { sim, whitelist } = setup();
    sim.createAllowance();
    sim.revokeAllowance();
    expect(sim.getLedger().state).toEqual(AllowanceState.REVOKED);
    expect(() =>
      sim.executeAgentTx(50n, whitelist[0], randomBytes(32)),
    ).toThrow(/Allowance not active/);
  });

  it("rejects createAllowance if claimed principalPk does not match the caller's key", () => {
    const { sim } = setup();
    sim.switchRole("principal");
    const fakePk = randomBytes(32);
    expect(() => {
      sim.circuitContext = sim.contract.impureCircuits.createAllowance(
        sim.circuitContext,
        fakePk,
        sim.agentPublicKey(),
      ).context;
    }).toThrow(/Caller is not principal/);
  });

  it("rejects the principal trying to call executeAgentTx", () => {
    const { sim, whitelist } = setup();
    sim.createAllowance();
    sim.switchRole("principal");
    expect(() => {
      sim.circuitContext = sim.contract.impureCircuits.executeAgentTx(
        sim.circuitContext,
        50n,
        whitelist[0],
        randomBytes(32),
      ).context;
    }).toThrow(/Caller is not agent/);
  });

  it("rejects the agent trying to revoke the allowance", () => {
    const { sim } = setup();
    sim.createAllowance();
    sim.switchRole("agent");
    expect(() => {
      sim.circuitContext = sim.contract.impureCircuits.revokeAllowance(
        sim.circuitContext,
      ).context;
    }).toThrow(/Caller is not principal/);
  });
});
