<script>
  let { checked = $bindable() } = $props();
</script>

<label>
  <input type="checkbox" bind:checked={checked} />
  Accept Terms
</label>
