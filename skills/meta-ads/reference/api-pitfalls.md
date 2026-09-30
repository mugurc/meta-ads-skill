# Marketing API pitfalls

## Access

- Credentials are `META_ACCESS_TOKEN` + `META_AD_ACCOUNT_ID` (see `.env.example`).
- A system-user token does not expire. Writing needs `ads_management`; reading needs `ads_read`.
  If the permission list comes back EMPTY, the app has no Marketing API use case:
  developers.facebook.com → your app → *Add use cases* → "Create & manage ads with Marketing API"
  + "Measure ad performance data".
- The system user must be assigned the ad account ("Manage campaigns") and, if you create
  creatives, the **Page**; otherwise creative creation fails (error 1341012).
- The Graph API version is pinned in `_meta.mjs` (`v23.0`); bump it as Meta retires versions.

## Scripts

| Script | What it does | Safety |
|---|---|---|
| `scripts/meta-status.mjs` | full status report | **read-only** |
| `scripts/meta-set-budget.mjs` | changes an ad set's daily budget | dry run by default, verifies the name, idempotent, never turns anything ON |

New write scripts should follow the same pattern: read first → do nothing if already as requested →
verify the name → write → read back. New ad sets / ads are created `PAUSED`.

## API pitfalls

**⚠️ Units — two different units in the same API.**
`insights.spend` returns **major units** (e.g. USD). `adset.daily_budget` and
`account.amount_spent` return **minor units** (cents; `20000` = 200.00). Mixing them when
writing means 100× the spend. For zero-decimal currencies (JPY, KRW) the multiplier is 1.

**⚠️ Opening an SKAN / iOS campaign.**
`is_skadnetwork_attribution=true` AND a campaign-level `promoted_object` are REQUIRED. Neither
can be changed later (error 1885090). If created with the flag off, Meta silently narrows
`user_os` to iOS 14.0–14.4 → zero impressions. The only fix is rebuilding the campaign.

**⚠️ One ad set per SKAN campaign.**
Adding a second one fails with "All ad sets must use the same attribution type". So each new
creative test is set up in its own campaign — and the "merge ad sets into one" advice is not
directly applicable to this setup.

**⚠️ Rate limit.** Ad set updates are limited to **1 request per 30 seconds** (error #613 /
4841018). `validate_only` calls count toward it. On 613, wait ~35 s and retry.

**⚠️ `placement_soft_opt_out` leak.** Meta still spends up to 5% of budget on placements that are
not in your list. When writing the field back, `explore_home` (returned by Meta itself) is rejected
without its counterpart `explore` (error 2490392) → remove it. For a hard block use account-level
`act_/account_controls` → `placement_controls.placement_exclusions` (`audience_controls` is a
required field there).

**⚠️ Ads Manager drafts can't be read via the API.** There is no `addrafts` endpoint. Stale fields
left in a draft can't be deleted from the UI; the fix is to build the ad set / ad through the API.
Failed Ads Manager requests also don't show up in the change history.

**⚠️ `learning_stage_info` is empty for SKAN campaigns.** You can't read the "learning limited"
label directly; compare weekly conversions against the 50 threshold (`meta-status.mjs` does this).

**⚠️ Reading value rules.** Request `criteria_type,criteria_values` on the criteria node,
otherwise it looks empty.

**⚠️ `status` vs `effective_status`.** Right after a change Meta temporarily returns
`effective_status = IN_PROCESS`; a check written as `== 'ACTIVE'` then says "no active ads" and
raises a false alarm. Use `status` to see what you set, `effective_status` to see whether it is
really live (and account for `IN_PROCESS` / `ADSET_PAUSED` / `CAMPAIGN_PAUSED`).

## Measurement: what to trust

| Data | Trust |
|---|---|
| `spend`, `impressions`, `inline_link_clicks` | **reliable** |
| `actions` → `mobile_app_install` (SKAN) | **incomplete** — ATT decliners not counted, 1–2 day delay |
| CPI per ad set / ad | **noise** at low volume, and modeled under SKAN |
| Your own new-user count | **the real yardstick** |
