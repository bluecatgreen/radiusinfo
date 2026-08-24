<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import 'leaflet/dist/leaflet.css';

	type Props = {
		lat: number;
		lon: number;
		zoom?: number;
		/** Optional aria-label for the map container. */
		label?: string;
	};

	let { lat, lon, zoom = 15, label = 'Map' }: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	let mapInstance: import('leaflet').Map | undefined;
	let markerInstance: import('leaflet').Marker | undefined;
	let L: typeof import('leaflet') | undefined;
	let ready = $state(false);

	onMount(async () => {
		// Dynamic import keeps Leaflet out of the SSR bundle — it touches `window`.
		L = (await import('leaflet')).default;

		// Leaflet's default marker icons are referenced via CSS-relative URLs that
		// break under bundlers. Re-point them at the Vite-managed asset URLs.
		const iconUrl = (await import('leaflet/dist/images/marker-icon.png')).default;
		const iconRetinaUrl = (await import('leaflet/dist/images/marker-icon-2x.png')).default;
		const shadowUrl = (await import('leaflet/dist/images/marker-shadow.png')).default;
		L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

		if (!containerEl) return;

		mapInstance = L.map(containerEl, {
			center: [lat, lon],
			zoom,
			scrollWheelZoom: true
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(mapInstance);

		markerInstance = L.marker([lat, lon]).addTo(mapInstance);
		ready = true;
	});

	$effect(() => {
		if (!ready || !mapInstance || !markerInstance) return;
		const next: [number, number] = [lat, lon];
		markerInstance.setLatLng(next);
		mapInstance.setView(next, zoom);
	});

	onDestroy(() => {
		mapInstance?.remove();
		mapInstance = undefined;
		markerInstance = undefined;
	});
</script>

<div
	bind:this={containerEl}
	role="application"
	aria-label={label}
	class="h-[500px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
></div>
