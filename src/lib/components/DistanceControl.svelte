<script lang="ts">
	/**
	 * Distance selector rendered as an overlay on the map. The currently
	 * selected value is reported to the parent via `onChange`; the value
	 * is kept locally so the control also reflects the parent's source of truth.
	 */

	export type DistanceKm = 1 | 5 | 10 | 20;

	type Props = {
		/** Current selected distance, in kilometres. */
		value: DistanceKm;
		/** Notified whenever the user picks a new distance. */
		onChange: (next: DistanceKm) => void;
		/** Optional label shown above the dropdown. */
		label?: string;
	};

	let { value, onChange, label = 'Radius' }: Props = $props();

	const options: DistanceKm[] = [1, 5, 10, 20];

	function onSelect(e: Event) {
		const next = Number((e.currentTarget as HTMLSelectElement).value) as DistanceKm;
		if (options.includes(next)) onChange(next);
	}
</script>

<div
	class="flex flex-col gap-1 rounded-md border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur"
>
	<label for="distance-select" class="text-[11px] font-medium text-slate-500">
		{label}
	</label>
	<select
		id="distance-select"
		class="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
		{value}
		onchange={onSelect}
	>
		{#each options as km (km)}
			<option value={km}>{km} KM</option>
		{/each}
	</select>
</div>
