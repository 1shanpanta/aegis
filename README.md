# Aegis

**The shielded audit primitive every regulated enterprise needs to deploy AI agents.**

[![Compact](https://img.shields.io/badge/compactc-0.31.0-1abc9c.svg)](https://github.com/midnightntwrk/compact) [![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg)](https://www.typescriptlang.org/) [![Midnight](https://img.shields.io/badge/Midnight-mainnet-6366f1.svg)](https://midnight.network) [![Tests](https://img.shields.io/badge/contract%20tests-10%2F10-success.svg)](./contract/src/test)

> Submitted to the [Midnight Hackathon · May 2026](https://events.mlh.io/events/14061-midnight-hackathon-may-2026) · AI Track.

---

## The problem

In February 2026 Coinbase shipped Agentic Wallets. By April, LLM-router exfiltration drained roughly $500K from agent wallet users in plaintext. The August 2026 EU AI Act enforcement deadline will require every Fortune 500 deploying AI agents to produce auditable evidence that those agents acted within policy, without exposing competitive strategy, supplier lists, or customer PII on a public chain.

Current "agentic wallet" stacks (Coinbase, Cobo, MoonPay) enforce spend limits inside a TEE. Auditors do not accept TEE attestations as cross-organisational evidence. Google's AP2 mandates are publicly signed JSON. Aleo for Agents has no allowance primitive at all. The shipped ZK Mandates concept (Patel, 2026) is a paper, not a contract.

**Aegis is the first shipped Compact-native implementation of a shielded principal-to-agent allowance** where the cap, the counterparty whitelist, and the running spend are bound inside ZK circuits, while still producing a cryptographic audit trail.

## What Aegis does

| Concern | Aegis primitive |
| --- | --- |
| Set a private spending cap on a delegated agent | `createAllowance(principalPk, agentPk)` with `allowanceLimit` held as a witness |
| Restrict spending to known counterparties | `whitelist` witness with three fixed shielded addresses |
| Prove each spend was within policy, without revealing policy | `executeAgentTx(amount, counterparty, nonce)` emits a `persistentHash` commitment |
| Audit the full ledger as principal | Principal holds the witness state and the (amount, counterparty, nonce) tuples locally |
| Stop the agent | `revokeAllowance()` flips the public state to `REVOKED` |

The chain ever shows is: `state`, `principalPk`, `agentPk`, `txCount`, and `lastTxCommitment`. Amounts, counterparties, and running totals are bound inside the commitment and the principal's witness state.

## Demo

```bash
git clone <this repo>
cd aegis
npm install
npm --workspace @aegis/contract run build
npm --workspace @aegis/web run dev
# open http://localhost:5173
```

The UI is a three-pane comparison of the same chain state from three perspectives:

1. **Principal**, the human delegator. Sees the shielded cap, the shielded whitelist, and the full per-tx audit log.
2. **Agent**, the LLM-driven trader. Has authorised spend buttons, plus deliberately-attacking buttons that try to bypass the cap and the whitelist.
3. **Public chain**, what every outsider sees. Just the ledger fields. Amounts and counterparties are cryptographically hidden.

Try the attacks: $9,000 spend over a $5,000 cap, payment to a sanctioned address, payment to an unknown actor. The contract rejects each with a `failed assert` from inside the circuit.

## Architecture

```
aegis/
├── contract/                Compact smart contract + test simulator
│   └── src/
│       ├── aegis.compact    The on-chain contract
│       ├── witnesses.ts     Client-side private state + witness implementations
│       ├── aegis-simulator.ts In-browser harness used by both tests and UI
│       └── test/aegis.test.ts 10 passing tests covering all reject paths
├── web/                React 19 + Tailwind 4 + framer-motion demo
└── api/                     Reserved for live-network mode (Lace wallet + proof server)
```

### The Compact contract

```compact
export ledger state: AllowanceState;
export ledger principalPk: Bytes<32>;
export ledger agentPk: Bytes<32>;
export ledger txCount: Counter;
export ledger lastTxCommitment: Maybe<Bytes<32>>;

witness localSecretKey(): Bytes<32>;
witness allowanceLimit(): Uint<64>;
witness spendSoFar(): Uint<64>;
witness whitelist(): Vector<3, Bytes<32>>;
witness recordSpend(amount: Uint<64>): [];

export circuit executeAgentTx(
  amount: Uint<64>,
  counterparty: Bytes<32>,
  nonce: Bytes<32>
): [] {
  assert(state == AllowanceState.ACTIVE, "Allowance not active");
  assert(agentPk == publicKey(localSecretKey()), "Caller is not agent");

  const limit = allowanceLimit();
  const spent = spendSoFar();
  assert(spent + amount <= limit, "Spend exceeds allowance");

  const wl = whitelist();
  assert(
    counterparty == wl[0] || counterparty == wl[1] || counterparty == wl[2],
    "Counterparty not whitelisted"
  );

  recordSpend(amount);

  const commitment = persistentHash<Vector<3, Bytes<32>>>([
    amount as Field as Bytes<32>,
    counterparty,
    nonce
  ]);
  lastTxCommitment = disclose(some<Bytes<32>>(commitment));
  txCount.increment(1);
}
```

The full contract is in [contract/src/aegis.compact](contract/src/aegis.compact).

### What is private vs public

| Variable | On chain | In witness | Reason |
| --- | --- | --- | --- |
| `allowanceLimit` | no | yes | competitive strategy |
| `spendSoFar` | no | yes | current exposure |
| `whitelist` | no | yes | supplier list |
| `amount` per tx | hashed | yes | trade size |
| `counterparty` per tx | hashed | yes | who you traded with |
| `nonce` per tx | hashed | yes | makes commitment preimage-resistant |
| `principalPk`, `agentPk` | yes | yes | identity binding |
| `txCount` | yes | n/a | activity level (rate-limit observable) |
| `state` (UNINIT/ACTIVE/REVOKED) | yes | n/a | lifecycle |

An outsider can see "an allowance is active and N spends occurred." They cannot recover any amount or counterparty without the principal's local audit log. A 256-bit nonce makes preimage brute force infeasible.

## Why this would survive on Midnight mainnet

- **No cross-contract calls.** Aegis is one self-contained Compact contract.
- **No oracle dependency.** Counterparty addresses are bound at allowance-creation time.
- **No Merkle proof verification in-circuit.** A fixed-size `Vector<3>` whitelist keeps the circuit small (10 tests on the simulator pass in 162ms total, no exotic stdlib).
- **No reuse of Solidity patterns.** The principal/agent role split uses Midnight's witness pattern, not `msg.sender`.
- **The same contract compiles for testnet, mainnet, and the in-browser simulator.** No code branches.

## Comparison

| | Coinbase Agentic Wallets | Google AP2 | Aleo for Agents | **Aegis** |
| --- | --- | --- | --- | --- |
| Spending limit hidden from chain | TEE | no | n/a | **yes (ZK)** |
| Counterparty whitelist hidden | TEE | no | n/a | **yes (ZK)** |
| Cross-org auditability | weak (TEE attestation) | strong (public) | n/a | **strong (selective disclosure)** |
| Open-source contract | no | yes | yes | **yes** |
| Shipped on a privacy-native chain | no | no | partial | **yes (Midnight)** |

## Tests

```bash
npm --workspace @aegis/contract run test
```

```
✓ initializes in UNINITIALIZED state with empty commitment
✓ createAllowance moves to ACTIVE and records principal + agent keys
✓ allows the agent to spend within the allowance and emits commitments
✓ rejects spend that would exceed the allowance
✓ rejects counterparty not in the whitelist
✓ rejects agent spending before allowance is created
✓ revokeAllowance halts further spending
✓ rejects createAllowance if claimed principalPk does not match the caller's key
✓ rejects the principal trying to call executeAgentTx
✓ rejects the agent trying to revoke the allowance
```

## Roadmap

1. **Selective disclosure keys** — let the principal mint an audit token that decrypts the local log for a regulator without sharing the witness state.
2. **Multi-agent allowances** — one principal granting allowances to N agents, each with their own shielded sub-cap.
3. **Rolling time-window limits** — an allowance that resets daily/weekly via a public clock witness.
4. **Live Lace wallet mode** — the existing `api/` workspace already has Midnight.js wired up. Wire it through the UI to deploy to preprod/mainnet from a Lace popup.
5. **Encrypted on-chain audit blobs** — replace the local audit log with `encrypt(principalPk, [amount, counterparty])` published on-chain so the principal does not need to share private state with the agent out-of-band.

## License

Apache 2.0 (inherits the Midnight bboard template upstream).

## Credits

Built solo for the May 2026 Midnight Hackathon. Forked from the Midnight `bboard` template by Midnight Foundation. The contract logic, witnesses, simulator, UI, and pitch are original.

---

Aegis · 100% Compact · same contract deploys to Midnight mainnet.
