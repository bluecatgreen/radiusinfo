<script lang="ts">
	import { onDestroy } from 'svelte';

	type Hit = {
		place_id: number;
		lat: string;
		lon: string;
		display_name: string;
		type?: string;
	};

	type Props = {
		/** Called with the picked address. */
		onSelect: (hit: Hit) => void;
		/** Optional placeholder text. */
		placeholder?: string;
	};

	let { onSelect, placeholder = 'Search an address…' }: Props = $props();

	let query = $state('');
	let hits = $state<Hit[]>([]);
	let activeIndex = $state(-1);
	let open = $state(false);
	let loading = $state(false);
	let errorMsg = $state<string | null>(null);

	let inputEl: HTMLInputElement | undefined = $state();
	let listEl: HTMLUListElement | undefined = $state();
	let rootEl: HTMLDivElement | undefined = $state();

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let currentController: AbortController | undefined;
	let lastQuery = '';

	function close() {
		open = false;
		activeIndex = -1;
	}

	function onDocClick(e: MouseEvent) {
		if (!rootEl) return;
		if (!rootEl.contains(e.target as Node)) close();
	}

	function onDocKey(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	$effect(() => {
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onDocKey);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onDocKey);
		};
	});

	async function runSearch(q: string) {
		currentController?.abort();
		const controller = new AbortController();
		currentController = controller;

		loading = true;
		errorMsg = null;
		try {
			const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}&limit=5`, {
				signal: controller.signal
			});
			if (!res.ok) throw new Error(`Search failed (${res.status})`);
			const body = (await res.json()) as { results: Hit[] };
			// Drop the result if the user has typed since we started.
			if (q !== lastQuery) return;
			hits = body.results ?? [];
			activeIndex = hits.length > 0 ? 0 : -1;
			open = hits.length > 0;
		} catch (e) {
			if ((e as { name?: string }).name === 'AbortError') return;
			errorMsg = e instanceof Error ? e.message : 'Search failed';
			hits = [];
			open = false;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		const q = query.trim();
		lastQuery = q;
		if (debounceTimer) clearTimeout(debounceTimer);
		if (q.length < 2) {
			hits = [];
			open = false;
			activeIndex = -1;
			return;
		}
		debounceTimer = setTimeout(() => void runSearch(q), 250);
	});

	function pick(hit: Hit) {
		query = hit.display_name;
		close();
		onSelect(hit);
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!open || hits.length === 0) {
			if (e.key === 'ArrowDown' && hits.length > 0) {
				open = true;
				activeIndex = 0;
				e.preventDefault();
			}
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = (activeIndex + 1) % hits.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = (activeIndex - 1 + hits.length) % hits.length;
		} else if (e.key === 'Enter') {
			if (activeIndex >= 0 && activeIndex < hits.length) {
				e.preventDefault();
				pick(hits[activeIndex]);
			}
		} else if (e.key === 'Escape') {
			close();
		}
	}

	$effect(() => {
		// Keep the active row in view inside the listbox.
		if (!open || !listEl) return;
		const el = listEl.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
		el?.scrollIntoView({ block: 'nearest' });
	});

	onDestroy(() => {
		if (debounceTimer) clearTimeout(debounceTimer);
		currentController?.abort();
	});
</script>

<div bind:this={rootEl} class="relative w-full max-w-2xl">
	<label class="sr-only" for="address-search-input">Address search</label>
	<div class="relative">
		<input
			bind:this={inputEl}
			bind:value={query}
			id="address-search-input"
			type="text"
			role="combobox"
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
			aria-expanded={open}
			aria-controls="address-search-listbox"
			aria-activedescendant={open && activeIndex >= 0
				? `address-search-opt-${activeIndex}`
				: undefined}
			aria-autocomplete="list"
			class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
			{placeholder}
			onkeydown={onKeyDown}
			onfocus={() => {
				if (hits.length > 0) open = true;
			}}
		/>
		{#if loading}
			<span
				class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400"
				aria-hidden="true"
			>
				<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
					<circle
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-opacity="0.25"
						stroke-width="4"
					/>
					<path
						d="M22 12a10 10 0 0 1-10 10"
						stroke="currentColor"
						stroke-width="4"
						stroke-linecap="round"
					/>
				</svg>
			</span>
		{/if}
	</div>

	{#if errorMsg}
		<p class="mt-2 text-sm text-red-600" role="alert">{errorMsg}</p>
	{/if}

	{#if open && hits.length > 0}
		<ul
			bind:this={listEl}
			id="address-search-listbox"
			role="listbox"
			class="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
		>
			{#each hits as hit, i (hit.place_id)}
				<li
					id={`address-search-opt-${i}`}
					role="option"
					aria-selected={i === activeIndex}
					data-index={i}
					class="cursor-pointer px-3 py-2 text-sm text-slate-700 {i === activeIndex
						? 'bg-blue-50 text-blue-900'
						: 'hover:bg-slate-50'}"
					onmousedown={(e) => {
						e.preventDefault();
						pick(hit);
					}}
					onmouseenter={() => (activeIndex = i)}
				>
					<div class="line-clamp-2">{hit.display_name}</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
