// SPDX-License-Identifier: Apache-2.0
//
// Provider stack for live Aegis on Midnight preprod.
//
// All work is intentionally deferred until buildLiveProviders() is called for
// the first time, so the simulator path stays zero-cost (no LevelDB open, no
// indexer WS connection, no Lace prompt) until the user explicitly opts in.

import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { setNetworkId, NetworkId } from "@midnight-ntwrk/midnight-js-network-id";

export const PRIVATE_STATE_ID = "aegisPrivateState" as const;

const DEFAULT_PROOF_URI =
  (import.meta.env.VITE_PROOF_SERVER_URI as string | undefined) ??
  "http://localhost:6300";

const DEFAULT_INDEXER_URI =
  (import.meta.env.VITE_INDEXER_URI as string | undefined) ??
  "https://indexer.preprod.midnight.network/api/v1/graphql";

const DEFAULT_INDEXER_WS_URI =
  (import.meta.env.VITE_INDEXER_WS_URI as string | undefined) ??
  "wss://indexer.preprod.midnight.network/api/v1/graphql/ws";

const PINNED_AEGIS_ADDRESS =
  (import.meta.env.VITE_AEGIS_CONTRACT_ADDRESS as string | undefined) ?? "";

export const pinnedAegisAddress = (): string => PINNED_AEGIS_ADDRESS;

export const isLaceAvailable = (): boolean =>
  typeof window !== "undefined" &&
  Boolean((window as unknown as { midnight?: { mnLace?: unknown } }).midnight?.mnLace);

type LaceApi = {
  enable: () => Promise<unknown>;
  serviceUriConfig: () => Promise<{
    indexerUri?: string;
    indexerWsUri?: string;
    proverServerUri?: string;
  }>;
  state: () => Promise<unknown>;
};

const getLace = (): LaceApi => {
  if (!isLaceAvailable()) {
    throw new Error(
      "Lace Beta wallet not detected. Install it from https://www.lace.io and switch to Preprod, then reload.",
    );
  }
  return (window as unknown as { midnight: { mnLace: LaceApi } }).midnight.mnLace;
};

export type AegisProviders = {
  privateStateProvider: ReturnType<typeof levelPrivateStateProvider>;
  publicDataProvider: ReturnType<typeof indexerPublicDataProvider>;
  zkConfigProvider: FetchZkConfigProvider<string>;
  proofProvider: ReturnType<typeof httpClientProofProvider>;
  walletProvider: unknown;
  midnightProvider: unknown;
};

let cachedProviders: AegisProviders | null = null;

/**
 * Lazily build the Midnight provider stack for live preprod.
 * Subsequent calls return the cached instance unless reset is true.
 */
export async function buildLiveProviders(reset = false): Promise<AegisProviders> {
  if (cachedProviders && !reset) return cachedProviders;

  setNetworkId("Preprod" as NetworkId);

  const lace = getLace();
  const walletApi = await lace.enable();
  const uriConfig = await lace.serviceUriConfig();

  const zkConfigProvider = new FetchZkConfigProvider<string>(window.location.origin);

  const providers: AegisProviders = {
    privateStateProvider: levelPrivateStateProvider({
      accountId: "aegis-demo",
      // Demo-grade password. For real deploys, prompt the user.
      privateStoragePasswordProvider: () => "aegis-demo-password",
    }),
    publicDataProvider: indexerPublicDataProvider(
      uriConfig.indexerUri ?? DEFAULT_INDEXER_URI,
      uriConfig.indexerWsUri ?? DEFAULT_INDEXER_WS_URI,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(
      uriConfig.proverServerUri ?? DEFAULT_PROOF_URI,
      zkConfigProvider,
    ),
    walletProvider: walletApi,
    midnightProvider: walletApi,
  };

  cachedProviders = providers;
  return providers;
}

export function clearProviderCache(): void {
  cachedProviders = null;
}
