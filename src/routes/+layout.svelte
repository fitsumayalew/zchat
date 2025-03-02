<script lang="ts">
    import { onMount } from "svelte";
	import "../app.css";

	let { children } = $props();



	// Initialize theme on mount
	onMount(() => {
		const savedTheme = localStorage.getItem("theme");
		const isDarkMode =
			savedTheme === "dark" ||
			(savedTheme === null &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);

		if (isDarkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	});
</script>

<main>
	{@render children()}
</main>
<!-- 
<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}
	
	nav {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--bg-3);
	}

	form {
		display: block;
		padding: 0;
		background-color: transparent;
	}

	form button {
		padding: 0;
		background-color: transparent;
		color: inherit;
	}
</style> -->
