<script lang="ts">
	import { onMount } from "svelte";
	import "../app.css";
	import { theme } from "$lib/stores/theme";

	let { children } = $props();

	// Initialize theme on mount
	onMount(() => {
		const savedTheme = localStorage.getItem("theme");
		const isDark =
			savedTheme === "dark" ||
			(savedTheme === null &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);

		theme.set({ isDark });
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		// Subscribe to theme changes to update DOM and localStorage
		theme.subscribe(({ isDark }: { isDark: boolean }) => {
			if (isDark) {
				document.documentElement.classList.add("dark");
				localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.classList.remove("dark");
				localStorage.setItem("theme", "light");
			}
		});
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
</style>
-->
