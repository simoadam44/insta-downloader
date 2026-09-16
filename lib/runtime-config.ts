import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Shared runtime config (single source of truth for extractor settings).
 *
 * Persistence layers (later wins):
 *  1. In-memory (this instance only)
 *  2. JSON file (`data/runtime-config.json` locally, os.tmpdir() on serverless)
 *     — written by Admin → API Config, read per-request by /api/extract.
 *     Survives module reloads/HMR and works across route instances.
 *  3. Env vars (always win — the production path on Vercel):
 *     EXTRACTOR_API_URL / EXTRACTOR_API_KEY / RATE_LIMIT_PER_MIN
 *
 * NOTE on serverless: the filesystem is ephemeral per instance, so for
 * production (Vercel) set the env vars — Admin-saved values apply to the
 * instance that served the Admin request.
 */

export type RuntimeConfig = {
  endpoint: string;
  apiKey: string;
  rateLimit: string;
};

const mem: RuntimeConfig = { endpoint: '', apiKey: '', rateLimit: '30' };
let hydrated = false;

/** One-time hydration: file → mem. After that, mem is the source of truth. */
function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  const f = readFileConfig();
  if (f.endpoint) mem.endpoint = f.endpoint;
  if (f.apiKey) mem.apiKey = f.apiKey;
  if (f.rateLimit) mem.rateLimit = f.rateLimit;
}

function configPath(): string {
  // Always outside the project tree: writing inside the project triggers
  // Next.js dev file-watcher recompiles (which reset in-memory state).
  // Tmp per machine; env vars remain the production path on Vercel.
  return path.join(os.tmpdir(), 'sss-runtime-config.json');
}

function readFileConfig(): Partial<RuntimeConfig> {
  try {
    const raw = fs.readFileSync(configPath(), 'utf8');
    const j = JSON.parse(raw);
    if (j && typeof j === 'object') {
      return {
        ...(typeof j.endpoint === 'string' ? { endpoint: j.endpoint } : {}),
        ...(typeof j.apiKey === 'string' ? { apiKey: j.apiKey } : {}),
        ...(typeof j.rateLimit === 'string' ? { rateLimit: j.rateLimit } : {})
      };
    }
  } catch {
    /* missing/corrupt file → ignore */
  }
  return {};
}

function writeFileConfig(cfg: RuntimeConfig): void {
  try {
    const p = configPath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(cfg), 'utf8');
  } catch {
    /* read-only fs (serverless) → in-memory still applies to this instance */
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  ensureHydrated();
  return { ...mem };
}

export function setRuntimeConfig(patch: Partial<RuntimeConfig>): RuntimeConfig {
  ensureHydrated();
  if (typeof patch.endpoint === 'string') mem.endpoint = patch.endpoint.trim();
  if (typeof patch.apiKey === 'string') mem.apiKey = patch.apiKey.trim();
  if (typeof patch.rateLimit === 'string') mem.rateLimit = patch.rateLimit.trim();
  writeFileConfig({ ...mem });
  return { ...mem };
}

export function effectiveExtractor(): { endpoint: string; key: string } {
  const cfg = getRuntimeConfig();
  return {
    endpoint: process.env.EXTRACTOR_API_URL?.trim() || cfg.endpoint,
    key: process.env.EXTRACTOR_API_KEY?.trim() || cfg.apiKey
  };
}

export function effectiveRateLimit(): number {
  const cfg = getRuntimeConfig();
  const raw = process.env.RATE_LIMIT_PER_MIN?.trim() || cfg.rateLimit;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 300) : 30;
}
