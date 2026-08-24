import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { search } from '$lib/server/geocode/nominatim';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const limitParam = Number(url.searchParams.get('limit') ?? '5');
	const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.trunc(limitParam), 1), 10) : 5;

	if (q.trim().length < 2) {
		return json({ results: [] });
	}

	try {
		const results = await search(q, limit);
		return json({ results });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Geocoding failed';
		throw error(502, message);
	}
};
