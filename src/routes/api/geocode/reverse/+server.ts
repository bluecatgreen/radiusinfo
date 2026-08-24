import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { reverse } from '$lib/server/geocode/nominatim';

export const GET: RequestHandler = async ({ url }) => {
	const lat = Number(url.searchParams.get('lat'));
	const lon = Number(url.searchParams.get('lon'));

	if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
		throw error(400, 'lat and lon are required');
	}

	try {
		const result = await reverse(lat, lon);
		return json({ result });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Reverse geocoding failed';
		throw error(502, message);
	}
};
