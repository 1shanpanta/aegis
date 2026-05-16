// SPDX-License-Identifier: Apache-2.0
// Aegis: shielded allowances for AI agent wallets.

import { CompiledContract } from "@midnight-ntwrk/compact-js";

export * from "./managed/aegis/contract/index.js";
export * from "./witnesses";
export { AegisSimulator } from "./aegis-simulator";

import * as CompiledAegisContract from "./managed/aegis/contract/index.js";
import * as Witnesses from "./witnesses";

export const CompiledAegisContractContract = CompiledContract.make<
  CompiledAegisContract.Contract<Witnesses.AegisPrivateState>
>("Aegis", CompiledAegisContract.Contract<Witnesses.AegisPrivateState>).pipe(
  CompiledContract.withWitnesses(Witnesses.witnesses),
  CompiledContract.withCompiledFileAssets("./managed/aegis"),
);
