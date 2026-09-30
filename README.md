# meta-ads-skill

A [Claude Code](https://claude.com/claude-code) skill for reading and safely managing a Meta
(Facebook/Instagram) ad account. It exists to prevent the interpretation mistakes that are easy to
make on **iOS / SKAdNetwork** and **low-volume** accounts: judging ads on modeled numbers, comparing
creatives while the ad set is still in the learning phase, trusting Meta's under-counted installs.

## What's inside

| Part | What it does |
|---|---|
| `skills/meta-ads/SKILL.md` | The framework Claude follows: six interpretation rules, rules for write operations, the costliest traps |
| `scripts/meta-status.mjs` | **Read-only** status report: campaigns, active ad sets + budgets, breakdown by ad set / ad / placement, learning-phase threshold, CPI |
| `scripts/meta-set-budget.mjs` | Changes an ad set's daily budget. **Dry run** by default; verifies the name, idempotent, reads back |
| `reference/api-pitfalls.md` | Marketing API traps that cost money or time (units, SKAN flag, rate limit…) |
| `reference/meta-rules.md` | Meta's own rules: learning phase, SKAN modeling/delay, scaling |

## Install

**As a plugin:**
```
/plugin marketplace add <owner>/meta-ads-skill
/plugin install meta-ads@meta-ads-skill
```

**Or manually:** copy `skills/meta-ads/` into your project's `.claude/skills/` (or `~/.claude/skills/`).

## Credentials

Node 18+ is enough; there are no dependencies. Provide the token and account ID via environment
variables or a `.env` file:

```bash
cp .env.example .env     # fill in META_ACCESS_TOKEN and META_AD_ACCOUNT_ID
node skills/meta-ads/scripts/meta-status.mjs --days 30
```

- `.env` is gitignored. **Never commit the token or paste it into chat.**
- `ads_read` is enough for the read-only report; the budget script needs `ads_management`.
- Writing to an ad account spends money: write scripts default to a dry run and never turn
  anything on. On your own account, still run them without `--apply` first.

## Disclaimer

Not an official Meta product. The rules quoted from Meta help pages were read on 2026-09-21 and
Meta changes them without notice; verify the numbers before relying on them. Scripts are provided
as is (MIT license).
