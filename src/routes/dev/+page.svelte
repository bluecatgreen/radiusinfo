<script>
  import CheckBox from '$lib/CheckBox.svelte';
  let accepted = $state(false);
</script>

<CheckBox bind:checked={accepted} />
<p>{accepted ? "✅ Accepted" : "❌ Not accepted"}</p>
