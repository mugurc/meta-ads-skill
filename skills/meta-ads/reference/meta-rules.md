# Meta's own rules

Read on: **2026-09-21**. Meta changes these pages without notice (the campaign limit going 9→24
is a live example) — check freshness before relying on the numbers. Quotes below are paraphrased
from the help pages; check the original wording before citing them.

## How to REACH these pages

The Meta help center is drawn with JavaScript. `WebFetch` and plain `curl` return **nothing
useful** — a ~1.5 KB login stub. `_fb_noscript=1`, `mbasic`, archive.org: all just the shell.
Don't waste time; two methods work:

1. **Browser automation** — navigate + read page text. The page renders in ~3 s; reading right
   away returns empty, so add a wait.
2. **A text proxy** such as `r.jina.ai`. Faster for bulk reading.

Source tags: **[OFFICIAL]** read from Meta's own page · **[3RD-PARTY]** another publication citing
Meta · **[INDUSTRY]** not official · **[?]** could not be verified.

---

# A · Learning phase

**A1. Threshold — [OFFICIAL]** (`help/112167992830700`)
> It generally happens after about **50 results per week since the last significant edit** to the ad set.

The counter runs from the **last significant edit**, not from campaign start. The unit is the
**ad set**; all ads in a set share one pool. Meta has not published a separate ad-level threshold.

**A2. Performance during learning — [OFFICIAL]**
> Ad sets are less stable and generally have **higher CPAs**.

> **Your results are not always a good indicator of future performance.**

With a cost goal / bid cap, exceeding the cap during learning is normal (`help/1364841787225722`).

**A3. "Learning limited" — [OFFICIAL]** (`help/269269737396981`)
The Delivery column says this when the set is unlikely to reach ~50 events a week. Meta says
explicitly **"this is not a penalty"**; it means the budget can't be spent efficiently. Reasons
Meta lists: small audience · low budget · low bid/cost control · rarely occurring optimization
event · high auction overlap · too many ads at once. It returns to "Active" by itself once enough
events arrive.

**A4. Meta's suggested fixes for "learning limited", in order — [OFFICIAL]**
**merge** ad sets/campaigns → **broaden** the audience → **raise** the budget → raise the
bid/cost control → switch to a **more frequent optimization event**.

**A5. WHAT RESETS LEARNING — the exact list [OFFICIAL]** (`help/316478108955072`)
- Any change to targeting
- Any change to ad creative
- A change to the optimization event
- **Adding a new ad to the ad set**
- Pausing the ad set for **7 days or more** (resets on re-activation)
- Changing the bid strategy

**A6. Resets that depend on magnitude — [OFFICIAL]**
Spend limit, bid control / cost goal / ROAS goal amount, and the **budget amount**. Meta's only
example: "$100 → $101 probably won't reset; $100 → $1000 might."
⚠️ **There is NO official percentage threshold.** The popular "don't exceed 20%, raise every
48 hours" rule is not a number Meta published. [INDUSTRY]

**A7. Explicitly NOT resetting — [OFFICIAL]**
Adding a **new ad set** to a CBO campaign doesn't reset the others · editing one ad set doesn't
reset **other ad sets in the same campaign** · CBO redistributing budget across ad sets doesn't reset.
⚠️ But in CBO, changing the **campaign budget** or the **campaign bid strategy** can reset several
ad sets at once.

**A8. How to read performance — [OFFICIAL]** (`help/1364841787225722`)
Evaluate over at least **one full week** · in CBO read the campaign, with ad set budgets read at
ad set level · avoid narrow breakdowns (the "breakdown effect" misleads) · focus on the
optimization event, not CPM. Before choosing a cost goal, accumulate **~50 events since the last
significant edit** (`help/942374239243867`).

---

# B · iOS / SKAdNetwork

**B1. ⚠️⚠️ THE MOST IMPORTANT ITEM — ad-set- and ad-level numbers are MODELED. [OFFICIAL]**
(`help/584603712214119`, `help/460276478298895`)

SKAN results reach Meta **only aggregated at CAMPAIGN level**. The distribution to ad set and ad
level is **statistical modeling** — not a raw count. If a campaign has a single ad set / single
ad, there is no modeling and the number is real.

→ An Ads Manager table saying "this ad is 147/install, that one 40" is **an estimate, not a
measurement**. Comparing ads inside one campaign on these numbers and dropping one is
methodologically wrong. Creative decisions can only be made with **separate campaigns** over a
long time.

Also: if an ad has several creative assets, **creative-level reporting is not supported** · **A/B
tests only at campaign level** · 1/7/28-day click and view windows are **not supported** · Ads
Manager shows only the **1st postback** (2nd and 3rd only in the Insights API, as coarse values).

**B2. Delay — [OFFICIAL]**
> SKAdNetwork does not report real-time data to Meta and has a delay of **at least 24 hours**.
> **Results are reported by the time Meta receives them, not by when the event happened.**

Technical reason [APPLE OFFICIAL]: SKAN 4 has three conversion windows (days 0–2, 3–7, 8–35);
when a window closes the postback goes out with **random delay** — the first **24–48 hours**,
the second/third **24–144 hours**.
→ The last 1–3 days of installs **always** look short and fill in later.

**B3. At low volume Apple also truncates data — [APPLE OFFICIAL]**
Apple assigns each install a "postback data tier". If the crowd is small it is **Tier 0**: only
the first postback arrives, **no conversion value at all**, and the source identifier shrinks to
2 digits. Tier 1 gives a coarse value instead of a fine one.
→ On a low-volume account an empty creative / conversion breakdown is **expected**.

**B4. ⚠️ Meta's SKAN liquidity target: at least 88 installs per day. [OFFICIAL]**
(`help/595608511524017`)
> A liquidity-oriented setup "**increases the likelihood of reaching at least 88 app installs
> per day**".

Meta's SKAN recommendations: use an Advantage+ app campaign · broaden targeting · enter as many
placements as possible · consolidate budget with Advantage+ campaign budget · use the **48-hour
conversion window** (faster feedback).

**B5. Campaign / ad set limits — [OFFICIAL, but contradictory]** (`help/651033805513936`)
**24 campaigns** per app · **one optimization type** per campaign · **one ad set** per Advantage+
app campaign · CBO up to **5 ad sets** · in the "Updating limit" state **18 manual campaigns** per
app ID · purchases only through **auction** · with cost cap, plan for the set to run **at least 3 days**.
⚠️ The developer docs (Oct 2023) still give the old number: 9 campaigns / 9 accounts / 5 sets.
**Try which one applies on your account.** [?]

**B6. Attribution difference — [OFFICIAL]** Meta's own attribution (AEM) uses 1/7/28-day clicks;
under SKAN attribution happens if the person installs **within 30 days** of visiting the product
page. Two methods showing different numbers is **not a bug**.

**B7. Meta's own "don't compare" warnings — [OFFICIAL]**
When a campaign has just started/stopped, large differences are normal because of SKAN delay —
"wait a few days for data to settle"; and **at low conversion volume the percentage gap grows**.

**B8. Meta fills missing data with modeling — [OFFICIAL]** (`help/311705270326952`)
Modeling works for both reporting and delivery optimization, and it **distributes conversions
across campaign / ad set / ad breakdowns**.

---

# C · Low-volume account

**C1. Consolidation — [OFFICIAL]** (`help/2419480091640105`)
> If you run too many ad sets at once, each gets **fewer learning opportunities and fewer
> results**; sets stay in learning longer and more budget is spent before the system can optimize.

Use **breakdowns** for reporting instead of splitting the audience. For iOS 14+ also: **group** by
geography/category/language/ARPU and **collect in one campaign** · merge highly overlapping
audiences · **don't target the same country in several campaigns**. A parallel Advantage+ app
campaign on the same audience "leads to poor delivery" (`help/711378409718185`).

**C2. How many ads per set — [OFFICIAL]** No hard cap is published. The only number given, in an
iOS 14+ context: **"up to six creative options in a set"** (`help/651033805513936`). Also "reduce
the number of ads per set, keep creative diversity — one ad can carry **up to 10 creative assets**"
(`help/2720085414702598`). Total ads per Page (an account limit, not a delivery limit): **250 ads**
for advertisers under $100k.

**C3. ⚠️ Budget / cost goal rule — [OFFICIAL]** (`help/203183363050448`)
> If you use a cost-per-result goal, the daily budget should be **at least 5× the goal**.

→ Example: at 55 TL per install you need **~275 TL/day** to run with a cost goal. Below that
budget don't use cost cap / bid cap; **lowest cost** is a must.

**C4. Budget flexibility — [OFFICIAL]** (`help/190490051321426`)
Meta can exceed the daily budget by up to **75%** on some days; the weekly total won't exceed
**7×** the daily budget (with ad set budget sharing on, 210% in a day, 8.4× per week).
→ **Don't look at one day's spend and say "over budget".** A set with a 150 TL/day budget can
spend 260 TL on some days and that is normal.
When lowering a lifetime budget, the new amount can't go below "amount spent + 10% of the last
2 days' spend". Lowering a budget near the end of the day may not apply.

**C5. Creative testing — [OFFICIAL]** (`help/290009911394576`, `help/239549606692303`)
A/B tests run **at least 7 days**, at most 30; tests shorter than 7 days come out inconclusive.
Test one variable; don't use the test audience in another campaign at the same time.
Statistical thresholds: estimated power **≥ 80%**, confidence **≥ 65%** to call a winner
(≥ 90% for lift tests).
⚠️ There is **no official minimum conversion count**. "50–100 conversions per variant" is
[INDUSTRY]. Meta's only nearby number is the learning phase's ~50 per week.

---

# D · Advantage+ / placements

**D1. Advantage+ placements INCLUDE Audience Network — [OFFICIAL]** (`help/196554084569964`)
> "Facebook, Messenger, Instagram, WhatsApp, **Audience Network** and Threads."

If you exclude no placement, your setup is already the same as Advantage+ placements. Meta's
claim: on average **11.7% lower CPA** than manual placements.

**D2. Placements can NOT be selected in an Advantage+ app campaign — [OFFICIAL]**
(`help/711378409718185`) Since they can't be selected there is no reporting on them; available
breakdowns are age, gender, country, device, platform.
⚠️ The same page later lists a "placement" breakdown too — **Meta's own text contradicts itself**;
try it on your account. [?]

**D3. `placement_soft_opt_out` — [OFFICIAL]** (Marketing API v24.0+)
> Lets you allocate **up to 5% of spend** to specific placements you exclude.

The reference doc says the percentage applies **per excluded placement** ("each excluded
placement") — not in total.
⚠️ Meta says it works only for **Sales and Leads** objectives; **app promotion is NOT listed** →
may not apply to that objective. [?]
Full exclusion (hard opt-out) behavior is unchanged.

**D4. Meta's alternatives to excluding placements — [OFFICIAL]** If the format doesn't fit, the
placement is excluded automatically anyway (use Advantage+ creative) · if the worry is cost,
**broaden the audience** instead of excluding placements · for brand safety use inventory filters
and block lists.

**D5. 2026 change — [3RD-PARTY]** For some advertisers ad-set-level placement exclusion was
removed and control moved to account level; v25.0 (Feb 2026) made the unified Advantage+
structure mandatory. Not verified in Meta's own publication. [?]

---

# What this means for a low-volume account

If the account's weekly results are below 50 per ad set (`scripts/meta-status.mjs` shows this):

- SKAN breakdowns coming back empty/modeled is **expected** (B1, B3)
- The set staying "learning limited" is **expected** (A3)
- The high CPI you see is partly the learning phase itself (A2)

**Don't:**
1. Drop creatives based on ad-level CPI — those numbers are **modeled** (B1).
2. Say "over budget" from one day's spend — there is **75% flexibility** (C4).
3. Intervene often — every ad added/removed and every 7+ day pause **resets learning** (A5).
4. Use cost cap / bid cap when the budget is not 5× the goal (C3).

**Do (in Meta's A4 order):** merge ad sets/campaigns → broaden the audience → raise the budget.
Reaching the threshold costs about 50 events/week × cost per event ÷ 7 per day. The one-ad-set-per-
SKAN-campaign rule limits merging (`api-pitfalls.md`); adding ads also resets learning (A5), so do
it once and then leave it alone.

⚠️ **A bigger budget alone isn't enough:** if retention is low, buying more installs widens the
hole (SKILL.md rule 6).

---

# Unverified

1. The **percentage** by which a budget change resets learning — no official number.
2. A "rolling 7-day window" (re-entering learning when events drop under 50) — Meta names only
   a **significant edit** as the cause.
3. An **official maximum number of ads** per ad set.
4. A **minimum conversion count** for comparing creatives.
5. Whether there is a separate learning threshold at ad level.
6. The SKAN campaign-limit contradiction: help center 24/18/1, developer docs 9/9/5.
7. The **upper bound** of SKAN delay — Meta only says "at least 24 hours".
8. Whether `placement_soft_opt_out` works for the **app promotion** objective.
9. The nature of the 88 installs/day figure — Meta says "increases the likelihood"; the
   "Apple privacy threshold" explanation is a third-party interpretation.
10. Whether a placement breakdown really exists for Advantage+ app campaigns (D2).
