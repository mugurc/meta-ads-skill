#!/usr/bin/env node
/**
 * Meta ad account — READ-ONLY status report.
 * Campaigns, active ad sets + budgets, spend breakdown by ad set / ad / placement,
 * distance to the learning-phase threshold, overall cost per install. GET only, never POST.
 *
 *   node scripts/meta-status.mjs             # last 7 days
 *   node scripts/meta-status.mjs --days 30   # last 30 days
 *
 * Credentials: META_ACCESS_TOKEN + META_AD_ACCOUNT_ID (environment or .env).
 */
import { get, account, MINOR } from './_meta.mjs';

const LEARNING_THRESHOLD = 50; // ~50 optimization events per week, per ad set
const daysArg = process.argv.indexOf('--days');
const DAYS = daysArg > -1 ? Number(process.argv[daysArg + 1]) : 7;

const ACC = account();
const iso = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const RANGE = { since: iso(new Date(Date.now() - (DAYS - 1) * 86400000)), until: iso(today) };

const { currency: CUR = '' } = await get(ACC, { fields: 'currency' });
const money = (n) => `${Math.round(n).toLocaleString('en-US')} ${CUR}`;
const installs = (r) =>
  (r.actions || []).filter((a) => a.action_type.includes('mobile_app_install'))
    .reduce((t, a) => t + Math.round(Number(a.value)), 0);
const cpi = (s, i) => (i ? money(s / i) : '—');

console.log(`Meta ad account ${ACC} · ${RANGE.since} → ${RANGE.until} (${DAYS} days)\n`);

const campaigns = await get(`${ACC}/campaigns`, {
  fields: 'name,effective_status,created_time,is_skadnetwork_attribution', limit: 50,
});
console.log('── CAMPAIGNS');
for (const c of campaigns.data) {
  console.log(`   ${String(c.effective_status).padEnd(16)} ${c.is_skadnetwork_attribution ? 'SKAN' : '    '} ${String(c.created_time).slice(0, 10)}  ${c.name}`);
}

const adsets = await get(`${ACC}/adsets`, { fields: 'name,effective_status,daily_budget', limit: 100 });
const active = adsets.data.filter((s) => s.effective_status === 'ACTIVE');
console.log('\n── ACTIVE AD SETS');
let totalBudget = 0;
for (const s of active) {
  const b = Number(s.daily_budget || 0) / MINOR; totalBudget += b;
  console.log(`   ${String(Math.round(b)).padStart(6)} ${CUR}/day  ${s.name}`);
}
console.log(`   ${String(Math.round(totalBudget)).padStart(6)} ${CUR}/day  ← total active budget`);
if (!active.length) console.log('   (no active ad sets — the account is not spending)');

async function breakdown(title, params) {
  const r = await get(`${ACC}/insights`, { time_range: RANGE, limit: 100, ...params });
  const rows = (r.data || []).map((x) => ({ ...x, _s: Number(x.spend || 0), _i: installs(x) }))
    .sort((a, b) => b._s - a._s);
  console.log(`\n── ${title}`);
  if (!rows.length) return console.log('   (no data)');
  for (const x of rows.slice(0, 12)) {
    const name = x.adset_name ?? x.ad_name ?? `${x.publisher_platform}/${x.platform_position}`;
    console.log(`   ${String(Math.round(x._s)).padStart(6)} ${CUR} | ${String(x._i).padStart(3)} installs | ${cpi(x._s, x._i).padStart(10)}/install | ${name}`);
  }
  return rows;
}
const bySet = await breakdown('BY AD SET', { level: 'adset', fields: 'adset_name,spend,actions' });
await breakdown('BY AD', { level: 'ad', fields: 'ad_name,spend,actions' });
await breakdown('BY PLACEMENT', { fields: 'spend,actions', breakdowns: 'publisher_platform,platform_position' });

// Learning phase: counted per AD SET, not per ad (all ads in a set share one pool).
const week = await get(`${ACC}/insights`, {
  level: 'adset', fields: 'adset_name,spend,actions', limit: 50,
  time_range: { since: iso(new Date(Date.now() - 6 * 86400000)), until: iso(today) },
});
console.log(`\n── LEARNING PHASE (last 7 days · threshold ${LEARNING_THRESHOLD} events/week, per AD SET)`);
let totalEvents = 0;
for (const s of week.data || []) {
  const i = installs(s); totalEvents += i;
  const status = i >= LEARNING_THRESHOLD ? '✓ exited' : `✗ ${Math.round((100 * i) / LEARNING_THRESHOLD)}% of threshold`;
  console.log(`   ${String(i).padStart(3)} events  ${status.padEnd(24)} ${s.adset_name}`);
}
if ((week.data || []).length > 1) {
  console.log(`   ${String(totalEvents).padStart(3)} events  if everything were in one set → ${totalEvents >= LEARNING_THRESHOLD ? 'would pass the threshold' : 'STILL below the threshold'}`);
}

const t = (bySet || []).reduce((a, x) => ({ s: a.s + x._s, i: a.i + x._i }), { s: 0, i: 0 });
console.log(`\n── TOTAL (${DAYS} days): ${money(t.s)} · ${t.i} installs · ${cpi(t.s, t.i)}/install`);
console.log('\n⚠️  Meta\'s install count is INCOMPLETE: users who decline ATT cannot be attributed and');
console.log('    SKAN postbacks arrive 1–2 days late. The real yardstick is your own new-user count.');
