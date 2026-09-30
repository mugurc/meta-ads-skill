#!/usr/bin/env node
/**
 * Change an ad set's DAILY BUDGET. Defaults to a DRY RUN: nothing is written.
 *
 *   node scripts/meta-set-budget.mjs --set <SET_ID> --name "Exact ad set name" --daily 150
 *   node scripts/meta-set-budget.mjs --set <SET_ID> --name "Exact ad set name" --daily 150 --apply
 *
 * --daily is in MAJOR units (150 = 150 USD/EUR/TRY…); the script converts to minor units.
 * Safety: stops if the ad set name does not match exactly (guards against touching the wrong
 * set); does nothing if the budget is already as requested (idempotent); reads back after
 * writing; never turns anything ON.
 * ⚠️ A budget increase can reset the learning phase (see reference/meta-rules.md A6).
 */
import { get, post, account, MINOR } from './_meta.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : undefined; };
const SET = arg('--set'), NAME = arg('--name'), DAILY = Number(arg('--daily'));
const APPLY = process.argv.includes('--apply');
if (!SET || !NAME || !Number.isFinite(DAILY) || DAILY <= 0) {
  console.error('Usage: --set <ID> --name "<exact ad set name>" --daily <major units> [--apply]');
  process.exit(1);
}

const { currency: CUR = '' } = await get(account(), { fields: 'currency' });
const set = await get(SET, { fields: 'name,effective_status,daily_budget' });
if (set.name !== NAME) { console.error(`ERROR: ad set name does not match → "${set.name}"`); process.exit(1); }
if (!set.daily_budget) { console.error('ERROR: this ad set has no daily budget (campaign budget / CBO?).'); process.exit(1); }

const oldMinor = Number(set.daily_budget);
const newMinor = Math.round(DAILY * MINOR);
console.log(`Ad set: ${set.name} · ${set.effective_status}`);
console.log(`Budget: ${oldMinor / MINOR} → ${newMinor / MINOR} ${CUR}/day  (API minor units: ${oldMinor} → ${newMinor})`);

if (oldMinor === newMinor) { console.log('Already at the requested budget, nothing changed.'); process.exit(0); }
if (!APPLY) { console.log('\nDRY RUN — nothing written. Add --apply to write.'); process.exit(0); }

await post(SET, { daily_budget: String(newMinor) });
const after = await get(SET, { fields: 'daily_budget' });
console.log(`Written. Read-back: ${Number(after.daily_budget) / MINOR} ${CUR}/day`);
