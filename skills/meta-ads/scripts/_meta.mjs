// Shared helpers: env loading + Graph API GET/POST. No dependencies (Node 18+).
import { existsSync, readFileSync } from 'node:fs';

export const API = 'https://graph.facebook.com/v23.0';

/** Process env first, then META_ENV_FILE (default ./.env). Values are never printed. */
function fromFile(name) {
  const path = process.env.META_ENV_FILE || '.env';
  if (!existsSync(path)) return undefined;
  const line = readFileSync(path, 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
}
export function env(name) {
  const v = process.env[name] || fromFile(name);
  if (!v) throw new Error(`${name} is missing. Set it as an environment variable or in .env (see .env.example).`);
  return v;
}

const TOKEN = () => env('META_ACCESS_TOKEN');
export const account = () => env('META_AD_ACCOUNT_ID');

export async function get(path, params = {}) {
  const u = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  const j = await (await fetch(u, { headers: { Authorization: `Bearer ${TOKEN()}` } })).json();
  if (j.error) throw new Error(`${path}: ${j.error.message}`);
  return j;
}

export async function post(path, body) {
  const j = await (await fetch(`${API}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })).json();
  if (j.error) throw new Error(`${path}: ${j.error.message} ${j.error.error_user_msg ?? ''}`);
  return j;
}

/** ⚠️ insights.spend is in MAJOR units (e.g. USD); daily_budget/amount_spent are in MINOR units (cents). */
export const MINOR = 100; // most currencies; use 1 for zero-decimal ones such as JPY/KRW
