<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

	if (page.status === 401) {
		goto("/login");
	}
</script>

<h1>{page.status}: {page.error?.message}</h1>
