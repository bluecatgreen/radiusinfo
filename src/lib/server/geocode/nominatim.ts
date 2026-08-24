/**
 * Server-side Nominatim client.
 *
 * The public Nominatim endpoint at https://nominatim.openstreetmap.org
 * enforces a strict usage policy: a meaningful User-Agent is mandatory,
 * and clients are limited to 1 request per second. To keep the policy
 * satisfied for every visitor (authenticated or not) we proxy requests
 * through this module, which:
 *   - sets a stable, identifying User-Agent
 *   - applies an in-process rate limit (one outgoing call per process)
 *   - caches responses to dampen repeat lookups
 */

import { env } from '$env/dynamic/private';

const ENDPOINT = 'https://nominatim.openstreetmap.org';
const MIN_INTERVAL_MS = 1100; // a hair over 1s to stay safely under the 1 req/s cap
const CACHE_MAX = 100;

type CacheValue = { ts: number; data: unknown };
const cache = new Map<string, CacheValue>();

let lastCallAt = 0;
let pending: Promise<unknown> = Promise.resolve();

function buildHeaders(): HeadersInit {
	// Nominatim rejects requests that don't identify the application.
	// ORIGIN is set in .env (e.g. http://localhost:5173) so we can include it.
	const ua = `radiusinfo/0.0.1 (+${env.ORIGIN ?? 'http://localhost'})`;
	return {
		'User-Agent': ua,
		Accept: 'application/json',
		'Accept-Language': 'en'
	};
}

async function callNominatim(path: string, params: Record<string, string>): Promise<unknown> {
	const url = new URL(path, ENDPOINT);
	for (const [k, v] of Object.entries(params)) {
		url.searchParams.set(k, v);
	}

	// Coalesce concurrent calls into a single in-flight request per "slot",
	// then space subsequent calls at MIN_INTERVAL_MS to respect the rate limit.
	const now = Date.now();
	const wait = Math.max(0, lastCallAt + MIN_INTERVAL_MS - now);

	const run = pending.then(async () => {
		await new Promise((r) => setTimeout(r, wait));
		lastCallAt = Date.now();
		const res = await fetch(url, { headers: buildHeaders() });
		if (!res.ok) {
			throw new Error(`Nominatim ${res.status} ${res.statusText}`);
		}
		return (await res.json()) as unknown;
	});

	// Make the chain survive individual failures.
	pending = run.catch(() => null);
	return run;
}

function cacheGet(key: string): unknown | undefined {
	const entry = cache.get(key);
	if (!entry) return undefined;
	if (Date.now() - entry.ts > 10 * 60 * 1000) {
		cache.delete(key);
		return undefined;
	}
	// LRU touch
	cache.delete(key);
	cache.set(key, entry);
	return entry.data;
}

function cacheSet(key: string, data: unknown): void {
	if (cache.size >= CACHE_MAX) {
		const oldest = cache.keys().next().value;
		if (oldest) cache.delete(oldest);
	}
	cache.set(key, { ts: Date.now(), data });
}

export type SearchHit = {
	place_id: number;
	lat: string;
	lon: string;
	display_name: string;
	type?: string;
	importance?: number;
};

export async function search(q: string, limit = 5): Promise<SearchHit[]> {
	const query = q.trim();
	if (query.length < 2) return [];

	const key = `search:${limit}:${query.toLowerCase()}`;
	const cached = cacheGet(key);
	if (cached) return cached as SearchHit[];

	const data = (await callNominatim('/search', {
		q: query,
		format: 'json',
		addressdetails: '1',
		limit: String(limit)
	})) as SearchHit[];

	cacheSet(key, data);
	return data;
}

export type ReverseHit = {
	place_id: number;
	lat: string;
	lon: string;
	display_name: string;
};

export async function reverse(lat: number, lon: number): Promise<ReverseHit | null> {
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
	const key = `reverse:${lat.toFixed(5)},${lon.toFixed(5)}`;
	const cached = cacheGet(key);
	if (cached !== undefined) return cached as ReverseHit | null;

	const data = (await callNominatim('/reverse', {
		lat: String(lat),
		lon: String(lon),
		format: 'json',
		zoom: '18'
	})) as ReverseHit | { error?: string };

	if (!data || typeof data !== 'object' || !('lat' in data)) {
		cacheSet(key, null);
		return null;
	}

	cacheSet(key, data);
	return data as ReverseHit;
}
