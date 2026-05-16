# Aegis · 2-minute demo video script

Target length: 1:55 to 2:00. Recorded screen at 1440p, no face cam. Tone: confident, calm, no music swell.

| t | Visual | Voiceover |
| --- | --- | --- |
| 0:00 | Open on the Aegis landing page (the three-pane app at /). Cursor hovers over the headline. | "Six weeks ago, LLM-router exfiltration drained half a million dollars from AI agent wallets in plaintext. By August, the EU AI Act starts demanding audit trails. Today every public agent wallet leaks the principal's strategy." |
| 0:15 | Zoom slightly into the principal pane. Allowance state shows "Not created". | "Aegis is a Compact-native primitive on Midnight Network. Principal grants the agent a shielded spending allowance." |
| 0:25 | Click `Create allowance` in the principal pane. All three panes update. Hover briefly over the green ACTIVE badge. | "One transaction. The cap, the counterparty whitelist, and the running spend are all witnesses. The chain just sees that the allowance is active." |
| 0:38 | Switch focus to the agent pane. Hover over the three whitelisted counterparties (Uniswap, Aave, 1inch). | "The agent only knows its own secret key. It has authorised spend buttons for whitelisted counterparties." |
| 0:48 | Click `$250 → Uniswap V4`. Watch the principal pane add an audit row, the public pane update `txCount` to 1 and `lastTxCommitment` to a fresh hex. | "Click. The agent transacts. The principal sees the full audit row: amount, counterparty, timestamp. The chain shows only an opaque hash." |
| 1:02 | Click `$1,000 → Aave V3 Pool` and `$500 → 1inch Aggregator` in quick succession. Public pane's `txCount` ticks to 3. | "Three real spends. Three opaque commitments. Anyone on Midnight reading the ledger sees nothing about amounts or counterparties." |
| 1:18 | Scroll to the public pane's "cryptographically hidden" panel. Pause for a beat. | "What stays hidden: the limit, every amount, every counterparty, the running total, the whitelist. Bound inside the commitment, not on the ledger." |
| 1:28 | Switch to the agent pane's "Attempt to bypass policy" section. Click `Try to spend $9,000 → expect reject`. Red error appears in the event log. | "Now the attacks. Drain attempt over the shielded cap. Rejected by the circuit itself: 'spend exceeds allowance'." |
| 1:40 | Click `Try to spend $10` for Tornado Cash. Red error in event log. | "Sanctioned counterparty. The whitelist is private but the proof of membership runs in the circuit. Rejected." |
| 1:48 | Return to the principal pane. Click `Revoke allowance`. State badge flips to red `Revoked`. | "Principal revokes. Agent is offline. Same contract that ran here deploys to Midnight mainnet." |
| 1:56 | Cut to a still frame: Aegis logo, "Compact · 10 of 10 contract tests passing · github.com/<…>", and the footer line. | "Aegis. The privacy primitive every regulated enterprise needs to deploy AI agents." |

Cuts:
1. Open: principal-pane wide
2. After create: three-pane wide
3. After whitelisted spends: zoom into public pane's `lastTxCommitment`
4. Attack demos: split-screen between agent action and event log
5. Revoke: principal pane close
6. End card: full-window logo

Mic gain: -12 dB, normalised to -3 dB peak. Lower-third title for hackathon track at 0:08: "Midnight Hackathon · May 2026 · AI Track".

Submit at https://midnight-hackathon-2026.devpost.com/ before Sunday 11:45 AM ET.
