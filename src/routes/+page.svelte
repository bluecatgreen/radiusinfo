<script lang="ts">
	import AddressSearch from '$lib/components/AddressSearch.svelte';
	import LeafletMap from '$lib/components/LeafletMap.svelte';
	import type { DistanceKm } from '$lib/components/DistanceControl.svelte';

	type Hit = {
		place_id: number;
		lat: string;
		lon: string;
		display_name: string;
		type?: string;
	};

	let selected = $state<Hit | null>(null);
	let view = $state({ lat: 20, lon: 0, zoom: 2 });
	// Lifted here so the future "things within this radius" query can read it
	// without having to dig into the map component.
	let distance = $state<DistanceKm>(5);

	function onSelect(hit: Hit) {
		selected = hit;
		const lat = Number(hit.lat);
		const lon = Number(hit.lon);
		if (Number.isFinite(lat) && Number.isFinite(lon)) {
			view = { lat, lon, zoom: 15 };
		}
	}
</script>

<main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
	<header class="space-y-2">
		<h1 class="text-3xl font-bold tracking-tight text-slate-900">radiusinfo</h1>
		<p class="text-slate-600">
			Type any address to drop a pin on the map. Powered by OpenStreetMap.
		</p>
	</header>

	<AddressSearch {onSelect} />

	{#if selected}
		<p class="text-sm text-slate-600">
			Showing: <span class="font-medium text-slate-900">{selected.display_name}</span>
			<span class="ml-2 text-slate-500">· Radius: {distance} KM</span>
		</p>
	{:else}
		<p class="text-sm text-slate-500">No location selected yet.</p>
	{/if}

	<LeafletMap
		lat={view.lat}
		lon={view.lon}
		zoom={view.zoom}
		{distance}
		onDistanceChange={(next) => (distance = next)}
	/>
</main>
