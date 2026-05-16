# Handoff — Aegis

**Last updated:** 2026-05-16
**Submission deadline:** Sunday 2026-05-17 · 11:45 AM ET (initial 10:00 AM ET)
**Repo:** https://github.com/1shanpanta/aegis
**Local dev:** http://localhost:5173

## Current state

| Layer | Status |
| --- | --- |
| Compact contract (`contract/src/aegis.compact`) | ✅ Shipped. 10/10 vitest tests pass. |
| Simulator engine (in-browser circuit execution) | ✅ Works end-to-end. Default mode. |
| Live engine (Lace + proof server + indexer) | ✅ Wired in `web/src/lib/live-engine.ts`. Untested against real preprod — needs Docker proof server + Lace Beta. |
| Marketing site (`web/`) | ✅ Hero → How It Works → DemoVideo → Comparison → 3-pane → TL;DR → Footer |
| Privy auth | ✅ Sign-in pill in hero top bar. Needs `VITE_PRIVY_APP_ID`. |
| Mode toggle | ✅ Simulator ↔ Live · preprod in the demo section. Live button auto-disabled if Lace not detected. |
| Public repo + auto-deploy | ⏳ Only GitHub is public. No Vercel/Netlify deploy yet. |
| Demo video | ⏳ Placeholder. Set `VITE_DEMO_EMBED_URL` to a YouTube URL (any format) and the iframe lights up. |
| Devpost submission | ❌ Not filed. Paste `docs/devpost-writeup.md`. |

## To submit (priority order)

1. **Record the 2-min demo video** — follow `docs/demo-script.md`. Use Loom or QuickTime, 1440p, no face cam. Upload to YouTube (unlisted is fine).
2. **Set the video URL** in `web/.env.local`:
   ```
   VITE_DEMO_EMBED_URL=https://youtu.be/YOUR_VIDEO_ID
   ```
   Any YouTube format works — auto-normalized to privacy-enhanced embed.
3. **Deploy `web/` to a public URL** so judges don't need to clone:
   ```bash
   cd web
   npx vercel deploy --prod
   # set VITE_PRIVY_APP_ID and VITE_DEMO_EMBED_URL in the Vercel dashboard
   ```
4. **Submit on Devpost** at https://midnight-hackathon-2026.devpost.com/. Paste `docs/devpost-writeup.md` into the form. Fill in:
   - Repo: `https://github.com/1shanpanta/aegis`
   - Demo video: the YouTube URL
   - Live demo: the Vercel URL
5. **(Optional, stretch)** Wire live mode end-to-end on preprod. Steps in `docs/live-mode-guide.html`. Adds significant pitch power but ~4-6h of plumbing.

## Run locally

```bash
git clone https://github.com/1shanpanta/aegis && cd aegis
npm install
npm --workspace @aegis/contract run build  # one-time, compiles Compact + tsc
npm --workspace @aegis/web run dev          # vite at :5173
```

Tests:
```bash
npm --workspace @aegis/contract run test
# 10/10 pass
```

Production build:
```bash
npm --workspace @aegis/web run build
# output: web/dist/
```

## Env vars

All optional. The simulator demo works with none set.

| Var | Used by | Notes |
| --- | --- | --- |
| `VITE_PRIVY_APP_ID` | hero auth pill | Get one from dashboard.privy.io. Already set locally in `web/.env`. |
| `VITE_PRIVY_CLIENT_ID` | Privy | Only needed for some server-side setups. Blank is fine. |
| `VITE_DEMO_EMBED_URL` | DemoVideo section | Any YouTube share URL. |
| `VITE_DEMO_VIDEO_URL` | DemoVideo section | Alternative: direct MP4/WebM. |
| `VITE_DEMO_POSTER_URL` | DemoVideo section | Optional poster image. |
| `VITE_PROOF_SERVER_URI` | live-providers | Default `http://localhost:6300`. |
| `VITE_INDEXER_URI` | live-providers | Default Midnight preprod indexer. |
| `VITE_INDEXER_WS_URI` | live-providers | Default Midnight preprod indexer WS. |
| `VITE_AEGIS_CONTRACT_ADDRESS` | live-engine | If set, joins this contract; otherwise deploys fresh per session. |

Template: `web/.env.example`. Both `web/.env` and `web/.env.local` are gitignored.

## Layout

```
contract/
  src/aegis.compact         # the Compact contract
  src/witnesses.ts          # AegisPrivateState type + impls
  src/aegis-simulator.ts    # in-browser harness (used by both tests and web/)
  src/test/aegis.test.ts    # 10 passing tests
  src/managed/aegis/        # committed compiled artifacts (zk keys + bytecode)

web/
  src/lib/aegis-engine.ts   # mode-aware engine, routes simulator OR live
  src/lib/live-providers.ts # Lace + indexer + proof server + level db
  src/lib/live-engine.ts    # deploy/find/call wrappers + readLiveLedger
  src/lib/use-mode.ts       # URL + localStorage persistence for ?mode=live
  src/components/           # Hero, Tldr, HowItWorks, DemoVideo, Comparison,
                            # PrincipalView, AgentView, PublicView, EventLog,
                            # ModeToggle, AuthButton, Shader, LiveChrome, ui/*

docs/
  devpost-writeup.md        # paste-ready Devpost submission text
  demo-script.md            # 2-min video script with timestamps
  live-mode-guide.html      # full live-mode wiring guide (styled, standalone)
  handoff.md                # this file
```

## Architecture highlights

- **Same contract code runs locally and on chain.** The Compact source in `contract/src/aegis.compact` is consumed by both the in-browser `AegisSimulator` (for the default demo) and `deployContract`/`findDeployedContract` (for live mode). No code branches.
- **Privacy is enforced by the circuit, not the chain.** `assert(spent + amount <= limit)` and the whitelist check run inside the ZK proof; the chain only verifies the proof, never sees the values.
- **Simulator reject path runs first in live mode.** When the engine is in live mode, it still runs the simulator step locally before broadcasting — so an over-cap attack fails in-browser without spending DUST.

## Known issues / watch-outs

- **Privy + Midnight mismatch.** Privy signs EVM/Solana, not Midnight. The Sign-in pill is for marketing-site identity only. Midnight contract calls always go through Lace.
- **Indexer WebSocket import warning at build.** `vite-plugin-wasm` warns about `isomorphic-ws` `WebSocket` import being undefined. Harmless — browser uses native WebSocket at runtime.
- **Compactc 0.31 ↔ compact-runtime ^0.16.** Don't downgrade the runtime; tests fail with version mismatch.
- **Faucet rate-limits per address per 24h.** If live-mode dev runs out of tDUST, fresh Lace wallet needed.
- **First proof after starting the proof server takes 4-8 seconds.** Warm-up cost. Subsequent proofs are sub-second.

## Commits to know

- `27631a1` initial aegis (contract + 10 tests + bboard scaffold)
- Subsequent commits: rename to `web/`, redesign sections, add Privy, wire live mode, polish 3-pane.
- Use `git log --oneline | head -30` for the full timeline.

## If I (or anyone else) picks this up after the deadline

1. The simulator works forever — it's self-contained and never needs a wallet.
2. Live mode needs the **four actors** running: Lace Beta + preprod tDUST + Docker proof server + indexer. See `docs/live-mode-guide.html`.
3. Tests run from a clean clone with just `npm install` then `npm --workspace @aegis/contract run test`. No external services needed.
4. The Compact contract is the source of truth — any architectural changes start there and propagate.
