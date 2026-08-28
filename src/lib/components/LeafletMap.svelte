<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import DistanceControl, { type DistanceKm } from './DistanceControl.svelte';

	type Props = {
		lat: number;
		lon: number;
		zoom?: number;
		/** Optional aria-label for the map container. */
		label?: string;
		/** Selected radius, in kilometres. */
		distance: DistanceKm;
		/** Notified when the user picks a different distance. */
		onDistanceChange: (next: DistanceKm) => void;
	};

	let { lat, lon, zoom = 15, label = 'Map', distance, onDistanceChange }: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	let mapInstance: import('leaflet').Map | undefined;
	let markerInstance: import('leaflet').Marker | undefined;
	let radiusInstance: import('leaflet').Circle | undefined;
	let L: typeof import('leaflet') | undefined;
	let ready = $state(false);

	onMount(async () => {
		// Dynamic import keeps Leaflet out of the SSR bundle — it touches `window`.
		L = (await import('leaflet')).default;
		delete L.Icon.Default.prototype._getIconUrl;

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
		radiusInstance = L.circle([lat, lon], {
			radius: distance * 1000,
			color: '#2563eb',
			weight: 2,
			opacity: 0.6,
			fillColor: '#3b82f6',
			fillOpacity: 0.1
		}).addTo(mapInstance);
		ready = true;
	});

	$effect(() => {
		if (!ready || !mapInstance || !markerInstance) return;
		const next: [number, number] = [lat, lon];
		markerInstance.setLatLng(next);
		radiusInstance?.setLatLng(next);
		mapInstance.setView(next, zoom);
	});

	$effect(() => {
		if (!ready || !radiusInstance) return;
		radiusInstance.setRadius(distance * 1000);
	});

	onDestroy(() => {
		mapInstance?.remove();
		mapInstance = undefined;
		markerInstance = undefined;
		radiusInstance = undefined;
	});
</script>

<div
	bind:this={containerEl}
	role="application"
	aria-label={label}
	class="relative h-[500px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
>
	<div class="absolute top-3 right-3 z-[1000]">
		<DistanceControl value={distance} onChange={onDistanceChange} />
	</div>
</div>
