# Aegis

**Shielded spending allowances for AI agents, on Midnight.**

[![Compact](https://img.shields.io/badge/compactc-0.31-1abc9c.svg)](https://github.com/midnightntwrk/compact) [![Midnight](https://img.shields.io/badge/Midnight-preprod-6366f1.svg)](https://midnight.network) [![Tests](https://img.shields.io/badge/contract%20tests-10%2F10-success.svg)](./contract/src/test)

A Compact-native contract on Midnight where a human principal grants an AI agent a spending allowance with a **shielded cap**, a **shielded counterparty whitelist**, and a **shielded running total**. The chain sees opaque commitments. The principal audits with a shared key. Built for the [Midnight Hackathon · May 2026](https://events.mlh.io/events/14061-midnight-hackathon-may-2026) AI Track.

## Run it

```bash
git clone https://github.com/1shanpanta/aegis && cd aegis
npm install
npm --workspace @aegis/contract run build
npm --workspace @aegis/web run dev
# open http://localhost:5173
```

The interactive demo runs the **real Compact circuits** in-browser via `AegisSimulator`. Toggle to `Live · preprod` for the real Midnight stack (requires Lace Beta + the proof server — see [docs/live-mode-guide.html](docs/live-mode-guide.html)).

## What's private vs public

| | On chain | In witness (private) |
| --- | --- | --- |
| Allowance limit | no | yes |
| Counterparty whitelist | no | yes |
| Running spend total | no | yes |
| Per-tx amount | hashed | yes |
| Per-tx counterparty | hashed | yes |
| Principal & agent pubkeys | yes | yes |
| txCount, state | yes | n/a |

Outsiders see "an allowance is active and N spends happened." A 256-bit nonce makes the commitment preimage-resistant.

## The contract

```compact
witness allowanceLimit(): Uint<64>;
witness spendSoFar(): Uint<64>;
witness whitelist(): Vector<3, Bytes<32>>;
witness recordSpend(amount: Uint<64>): [];

export circuit executeAgentTx(
  amount: Uint<64>, counterparty: Bytes<32>, nonce: Bytes<32>
): [] {
  assert(state == AllowanceState.ACTIVE, "not active");
  assert(agentPk == publicKey(localSecretKey()), "not agent");
  assert(spendSoFar() + amount <= allowanceLimit(), "over limit");
  const wl = whitelist();
  assert(counterparty == wl[0] || counterparty == wl[1] || counterparty == wl[2], "not whitelisted");
  recordSpend(amount);
  lastTxCommitment = disclose(some<Bytes<32>>(
    persistentHash<Vector<3, Bytes<32>>>([amount as Field as Bytes<32>, counterparty, nonce])
  ));
  txCount.increment(1);
}
```

Full source in [`contract/src/aegis.compact`](contract/src/aegis.compact).

## Tests

```bash
npm --workspace @aegis/contract run test
```

All ten reject paths covered: over-limit, off-whitelist, wrong-caller, post-revoke, agent-as-principal, principal-as-agent, etc.

## Layout

```
contract/      Compact contract + tests + simulator
web/           React 19 + Tailwind 4 marketing site & interactive demo
docs/          devpost-writeup.md · demo-script.md · live-mode-guide.html
```

## Docs

- [Devpost writeup](docs/devpost-writeup.md) — paste-ready submission text
- [Demo script](docs/demo-script.md) — 2-minute video walkthrough
- [Live-mode guide](docs/live-mode-guide.html) — wire Lace + proof server + indexer

## License

Apache 2.0.
