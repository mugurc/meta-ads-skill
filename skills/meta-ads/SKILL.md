---
name: meta-ads
description: Anything about a Meta (Facebook/Instagram) ad account. Ad performance, spend, budget, cost per install (CPI), campaign / ad set / creative analysis, placement breakdown, learning phase, SKAdNetwork / iOS attribution, ATT's effect on measurement, changing budgets, Marketing API queries. Use for questions like "how are the ads doing", "what's the CPI", "which ad works", "change the budget".
---

# Meta ads

## Setup (once)

Provide `META_ACCESS_TOKEN` and `META_AD_ACCOUNT_ID` (`act_…`) as environment variables, or put
them in a `.env` file in the working directory (`META_ENV_FILE` points to another path).
Never print the token, paste it into chat, or commit it. Node 18+ is required; no other dependencies.

## First thing, every time

One command gives the whole picture. Don't hand-write curl (paths are relative to this skill's folder):

```bash
node scripts/meta-status.mjs --days 30
```

Campaigns, active ad sets + budgets, spend breakdown by ad set / ad / placement, distance to the
learning-phase threshold and overall CPI. **Read-only**, never a POST.

API pitfalls and scripts: `reference/api-pitfalls.md`
Meta's own rules (learning phase, SKAN, scaling): `reference/meta-rules.md`

⚠️ Don't try to read Meta help pages with `WebFetch`/`curl` — they render with JavaScript and
return an empty login shell. The working methods are at the top of `reference/meta-rules.md`.

## Six rules for interpreting results

Reading numbers without the framework around them can end in advice that is the exact opposite
of Meta's own guidance. So:

**1. Check the learning phase first, then compare ads.**
An ad set that does not reach ~50 optimization events per week is "learning limited" and Meta's
delivery is unreliable. Saying "this ad is more efficient than that one" in that state mistakes
noise for signal. If the status report shows sets below the threshold, build every conclusion on it.

**2. ⚠️ On SKAN, ad-set- and ad-level numbers are MODELED — not measured.**
Meta states that SKAN results reach it only **aggregated at campaign level**; the ad set and ad
breakdown is statistical modeling (real only if the campaign has a single ad set / single ad).
Comparing ads in the same campaign on these numbers and dropping one is methodologically wrong.
Creative decisions belong to separate campaigns run over a long period (`reference/meta-rules.md` B1).

**3. Don't decide on small numbers.**
A CPI computed from 4 installs is not a finding. Without meaningful volume, say "insufficient data".

**4. Don't call "over budget" from one day's spend.**
Meta can spend up to **75% above** the daily budget on a given day; the weekly total will not
exceed 7× the daily budget. If you are looking for deviation, sum by week.

**5. Meta's install count is INCOMPLETE — the real yardstick is your own new-user count.**
Users who decline ATT cannot be attributed; SKAN postbacks arrive 1–2 days late, so the latest
days always look short. Ask for the user's daily sign-up / account count (or query it yourself if
you have access) and judge ad decisions on that, not on Meta's install number.

**6. Look at retention before buying more installs.**
If arrivals don't stay, raising the budget just widens the hole. Ask for D1/D7 retention and
first-day engagement data; if low, discuss that first.

## Write operations — hard rules

Writing to an ad account **spends money**. Therefore:

- **No bare curl POST.** Every write goes into a script under `scripts/`; the user sees it,
  approves it, then it runs. Ready-made: `scripts/meta-set-budget.mjs`
  (**dry run** by default; `--apply` to write).
- Scripts are **idempotent**: read current state first, do nothing if it is already as requested.
- Scripts verify **ID + name** — touching the wrong ad set can mean 100× the spend.
- New ad sets / ads are **ALWAYS created `PAUSED`**. Turning them on is a separate, explicit decision.
- Validate risky changes first with `execution_options=["validate_only"]`.
- Double-check minor units (cents) when writing a budget.
- Never write without the user explicitly asking for it.

## The three costliest traps

Details in `reference/api-pitfalls.md`:

1. **Unit confusion** — `insights.spend` is in major units (e.g. USD), but `daily_budget` and
   `amount_spent` are in **minor units** (cents; `15000` = 150.00). Mixing them is 100× spend.
2. **SKAN flag** — an iOS campaign must be created with `is_skadnetwork_attribution=true` AND a
   campaign-level `promoted_object`; neither can be changed later. With the flag off, Meta
   silently narrows targeting to iOS 14.0–14.4 → zero impressions. A SKAN campaign also gets
   only one ad set per campaign.
3. **Audience Network leak** — even if a placement is not in the list, Meta may spend up to 5%
   of the budget on placements in the ad set's `placement_soft_opt_out` field.
