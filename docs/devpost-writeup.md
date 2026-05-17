# Aegis · Devpost submission text

Paste into the Devpost fields verbatim. Lengths target the form's hints.

## Tagline (140 chars)

The shielded audit primitive every regulated enterprise needs to deploy AI agents. Compact-native, on Midnight.

## Inspiration

In February 2026 Coinbase shipped Agentic Wallets. By April, LLM-router exfiltration drained roughly $500K from AI agent users in plaintext. The August 2026 EU AI Act enforcement deadline will force every Fortune 500 deploying AI agents to produce auditable evidence that those agents acted within policy, without exposing competitive strategy, supplier lists, or customer PII on a public chain.

Coinbase, Cobo, MoonPay all enforce agent spend limits inside a TEE. Auditors do not accept TEE attestations as cross-organisational evidence. Google's AP2 mandates are publicly signed JSON. Aleo for Agents has no allowance primitive at all. The "ZK Mandates for AP2" concept (Patel, 2026) is a paper.

Aegis is the first shipped Compact-native implementation of a shielded principal-to-agent allowance.

## What it does

Aegis is a single Compact smart contract on Midnight, ~80 lines, three circuits, five witnesses. It is a **primitive** other AI agent infrastructure wraps, not a full agent runtime or a market. Specifically, it lets a human principal grant an AI agent a spending allowance where:

1. The allowance amount is held only as a witness (off-chain, principal-side).
2. The counterparty whitelist is held only as a witness.
3. The running spend total is held only as a witness, updated by a side-effecting witness function each time the agent transacts.
4. The agent transacts by submitting a ZK proof that `amount + spend_so_far <= limit` AND `counterparty in whitelist`. The chain receives only an opaque `persistentHash([amount, counterparty, nonce])` commitment.
5. The principal can audit by holding the (amount, counterparty, nonce) tuples locally.
6. The principal can revoke the allowance at any time.

The chain ever shows: state (UNINIT/ACTIVE/REVOKED), principalPk, agentPk, txCount, and lastTxCommitment.

### Scope and non-goals

Aegis is the cryptographic enforcement layer underneath an agent, not the agent itself.

- **Uniswap V4, Aave V3, 1inch** in the demo are whitelisted counterparty *addresses*, not live DEX integrations. Settlement to those venues is downstream wiring the dApp developer adds; Aegis's contribution is the shielded cap, shielded whitelist, and ZK proof of compliance per spend.
- **No LLM is bundled.** The "Agent" pane is a button panel representing what an external agent runtime (LangChain, Claude tool-use, an autonomous trader, a Coinbase Agentic Wallet hook) would call into. Plug any of those into the Aegis circuit and they inherit the audit guarantee.
- **No payment rails.** The contract emits commitments, not transfers. A production integration would pair Aegis with a settlement primitive (USDC, Midnight-native tokens, account abstraction) outside the scope of this submission.

Said as a single line: **Aegis isn't an agent. It's the primitive your agent calls so the chain stays private and the regulator stays satisfied.**

## Who uses this

Aegis is dev infrastructure. Four buyer profiles are immediate:

1. **Agentic wallet vendors** (Coinbase Agentic Wallets, Cobo, MoonPay agent SDKs). They currently enforce agent spend policies inside a TEE. Auditors and EU regulators don't accept TEE attestations as cross-organisational evidence. Aegis swaps the TEE for a ZK proof that *is* cross-org acceptable. They wrap their existing SDK around Aegis and ship.
2. **AI-managed treasuries and quant funds.** An LP grants the AI portfolio manager a shielded allowance. The chain proves the AI stayed within mandate without leaking position sizing, counterparty venues, or strategy to competitors reading the ledger.
3. **Enterprise procurement automation.** Finance grants the AI ops agent a shielded allowance with an approved-vendor whitelist. Internal auditors get the full audit log; the public chain doesn't see what the company buys or how much.
4. **DAOs with operational AI assistants.** Treasury grants the AI assistant a shielded allowance for gas refills, oracle subscriptions, and infrastructure. Competitor DAOs reading the ledger learn nothing about cost structure.

Integration is a `deployContract` call, witness providers that back onto whatever key store the deployer already uses, and one `executeAgentTx` call per spend. The contract source is ~80 lines.

## How we built it

- **Compact smart contract** with explicit `disclose()` keyword: privacy by construction, every published value is opt-in.
- **Five witness functions** (`localSecretKey`, `allowanceLimit`, `spendSoFar`, `whitelist`, `recordSpend`) where `recordSpend` is impure and updates private state.
- **Single domain-tagged hash** for principal/agent identity derivation (`persistentHash([pad(32, "aegis:pk:"), sk])`). No `msg.sender`.
- **Fixed `Vector<3, Bytes<32>>` whitelist** instead of Merkle proof verification: same privacy guarantee, drastically smaller circuit.
- **TypeScript-first toolchain**: Compact source compiles to ZK IR + TypeScript bindings consumed by the React frontend.
- **In-browser `AegisSimulator`** that drives the same circuit pipeline locally for the demo. Same contract code deploys to Midnight mainnet.
- **React 19 + Tailwind 4 + framer-motion** for the three-pane comparison UI.

## Challenges we ran into

1. Compactc 0.31 emits code expecting compact-runtime ≥ 0.16. The scaffold defaulted to 0.15 and tests failed with a runtime version mismatch. Bumped the workspace dep.
2. Pre-set bboard test paths referenced `../managed/bboard` after moving the simulator out of the test folder; tightened the imports.
3. The Merkle whitelist was the original design but it would have taken half the build budget; a fixed Vector<3> ships in 30 lines and demos identically.
4. Identifying the right framing. The first pitch led with the "$500K hack" headline. An adversarial review showed the stronger framing is the EU AI Act enforcement deadline plus the absence of cross-org-acceptable audit evidence. Same primitive, much stronger pitch.

## Accomplishments we're proud of

- All ten contract tests pass (every reject path: over-limit, off-whitelist, wrong-caller, post-revoke, agent-as-principal, principal-as-agent).
- The three-pane demo makes the privacy guarantee visible: same chain state, three valid views of it.
- The same Compact contract that runs in-browser via the simulator deploys to Midnight mainnet without a code branch.

## What we learned

- Compact's witness pattern is the unique seam. The TS escape hatch on top of a ZK circuit is the thing other ZK chains do not have as ergonomically.
- "Privacy is invisible" is solvable by showing three views of the same state, not by trying to make privacy itself visually exciting.
- The Fall 2025 winner archetype (MedProof, EclipseProof, HelixChain, BrickChain) is "regulated industry × sized TAM × ZK unlocks deployment". Aegis fits.

## What's next for Aegis

1. Selective disclosure keys so the principal can mint a single-use audit token for a regulator without sharing the entire witness state.
2. Encrypted on-chain audit blobs so the principal does not need to share private state with the agent out-of-band.
3. Multi-agent allowances and rolling time-window caps.
4. Live Lace wallet mode: deploy to Midnight preprod and let the demo execute against the real proof server.
5. Apply to Midnight Build Club.

## Built with

`midnight-network` · `compact` · `typescript` · `react` · `tailwind` · `framer-motion` · `vitest`

## Try it yourself

```bash
git clone <repo>
cd aegis
npm install
npm --workspace @aegis/contract run build
npm --workspace @aegis/web run dev
# open http://localhost:5173
```

Run the tests:

```bash
npm --workspace @aegis/contract run test
```

## Demo video

[link]

## Repo

[link]
