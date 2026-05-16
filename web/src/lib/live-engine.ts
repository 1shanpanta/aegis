// SPDX-License-Identifier: Apache-2.0
//
// Live-mode adapter on top of the Aegis Compact contract.
//
// Wraps deployContract / findDeployedContract, exposes typed call wrappers
// for the three circuits, and offers a one-shot ledger fetch so the engine
// can refresh public state after each tx without managing an RxJS lifecycle.

import { deployContract, findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { firstValueFrom } from "rxjs";
import { map, take, timeout } from "rxjs/operators";
import {
  CompiledAegisContractContract,
  ledger,
  type AegisPrivateState,
  type Ledger,
} from "@aegis/contract";
import {
  buildLiveProviders,
  PRIVATE_STATE_ID,
  pinnedAegisAddress,
} from "./live-providers";

export type LiveDeployment = {
  providers: Awaited<ReturnType<typeof buildLiveProviders>>;
  deployed: unknown;
  contractAddress: string;
};

type DeployedContract = {
  callTx: {
    createAllowance: (
      principalPk: Uint8Array,
      agentPk: Uint8Array,
    ) => Promise<{ public: { txHash: string; blockHeight: number } }>;
    executeAgentTx: (
      amount: bigint,
      counterparty: Uint8Array,
      nonce: Uint8Array,
    ) => Promise<{ public: { txHash: string; blockHeight: number } }>;
    revokeAllowance: () => Promise<{ public: { txHash: string; blockHeight: number } }>;
  };
  deployTxData: {
    public: {
      contractAddress: string;
    };
  };
};

/**
 * Deploy a fresh Aegis contract. Returns the deployment handle plus the
 * contract address the principal should hand to the agent.
 */
export async function deployAegisOnChain(
  initialPrivateState: AegisPrivateState,
): Promise<LiveDeployment> {
  const providers = await buildLiveProviders();
  const deployed = (await deployContract(providers as never, {
    compiledContract: CompiledAegisContractContract as never,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: initialPrivateState as never,
    args: [],
  } as never)) as unknown as DeployedContract;
  return {
    providers,
    deployed,
    contractAddress: deployed.deployTxData.public.contractAddress,
  };
}

/**
 * Attach to an already-deployed Aegis contract (e.g. the canonical demo
 * instance pinned via VITE_AEGIS_CONTRACT_ADDRESS).
 */
export async function joinAegisOnChain(
  contractAddress: string,
  initialPrivateState: AegisPrivateState,
): Promise<LiveDeployment> {
  const providers = await buildLiveProviders();
  const deployed = (await findDeployedContract(providers as never, {
    contractAddress,
    compiledContract: CompiledAegisContractContract as never,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: initialPrivateState as never,
  })) as unknown as DeployedContract;
  return { providers, deployed, contractAddress };
}

/**
 * Decide whether to join the pinned demo contract or deploy a fresh one.
 * Used the first time the user toggles into live mode.
 */
export async function startLive(
  initialPrivateState: AegisPrivateState,
): Promise<LiveDeployment> {
  const pinned = pinnedAegisAddress();
  if (pinned) return joinAegisOnChain(pinned, initialPrivateState);
  return deployAegisOnChain(initialPrivateState);
}

/**
 * Call the three Aegis circuits via the deployed contract handle.
 * Each resolves once the tx is finalized.
 */
export async function callCreateAllowance(
  deployment: LiveDeployment,
  principalPk: Uint8Array,
  agentPk: Uint8Array,
): Promise<void> {
  const d = deployment.deployed as DeployedContract;
  await d.callTx.createAllowance(principalPk, agentPk);
}

export async function callExecuteAgentTx(
  deployment: LiveDeployment,
  amount: bigint,
  counterparty: Uint8Array,
  nonce: Uint8Array,
): Promise<void> {
  const d = deployment.deployed as DeployedContract;
  await d.callTx.executeAgentTx(amount, counterparty, nonce);
}

export async function callRevokeAllowance(deployment: LiveDeployment): Promise<void> {
  const d = deployment.deployed as DeployedContract;
  await d.callTx.revokeAllowance();
}

/**
 * One-shot fetch of the latest public ledger state. The indexer's WS
 * subscription emits frequently; we take(1) to grab the current snapshot
 * after a tx, with a generous timeout for finality.
 */
export async function readLiveLedger(deployment: LiveDeployment): Promise<Ledger> {
  const obs = (deployment.providers.publicDataProvider as unknown as {
    contractStateObservable: (
      address: string,
      opts: { type: "latest" },
    ) => import("rxjs").Observable<{ data: unknown }>;
  }).contractStateObservable(deployment.contractAddress, { type: "latest" });

  return firstValueFrom(
    obs.pipe(
      take(1),
      timeout(30_000),
      map((s) => ledger(s.data as never) as Ledger),
    ),
  );
}
