<script lang="ts">
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import LightModeIcon from "$lib/icons/LightModeIcon.svelte";
	import DarkModeIcon from "$lib/icons/DarkModeIcon.svelte";
	import SignOutIcon from "$lib/icons/SignOutIcon.svelte";
	import { schema } from "../../zero.schema.js";
	import { PUBLIC_SERVER } from "$env/static/public";
	import { preload, z } from "$lib/z.svelte";
	import { Query } from "zero-svelte";
    import Button from "$lib/components/Button.svelte";
    import { goto } from "$app/navigation";
	import { theme } from '$lib/stores/theme';

	let { data, children } = $props();
	z.build({
		schema,
		server: PUBLIC_SERVER,
		userID: data.user.id,
		auth: () => data.user.jwt,
	});

	preload(z);

	let searchQuery = $state("");
	const chatsQuery = $derived(
		z.current.query.chat
			.orderBy("createdAt", "desc")
			.where("title", "LIKE", `%${searchQuery}%`)
	);
	const chats = $derived(new Query(chatsQuery));
</script>

<div class="chat-container">
	<aside class="chat-sidebar">
		<div class="sidebar-header">
			<h2>Zchat</h2>
			<Button label="New Chat" onClick={() => goto(`/chat`)} />
		</div>

		<div class="search-container">
			<input
				type="text"
				placeholder="Search conversations..."
				class="search-input"
				bind:value={searchQuery}
			/>
		</div>

		<ul class="chat-list">
			{#each chats.current as { id, title }}
				<li class="chat-item">
					<a
						href="/chat/{id}"
						class="chat-link"
						class:active={id === page.params.id}
					>
						{title || "New Chat"}
					</a>
				</li>
			{/each}

			{#if chats.current.length === 0}
				<li class="empty-results">No conversations found</li>
			{/if}
		</ul>

		<div class="user-section">
			<div class="user-controls">
				<div class="user-info">
					<span class="user-name">{data.user.name}</span>
				</div>
				<div class="action-buttons">
					<button
						type="button"
						class="action-button theme-toggle"
						onclick={() => theme.update(t => ({ isDark: !t.isDark }))}
						aria-label="Toggle theme"
					>
						{#if $theme.isDark}
							<DarkModeIcon />
						{:else}
							<LightModeIcon />
						{/if}
					</button>
					<form action="/chat?/logout" method="POST">
						<button
							type="submit"
							class="action-button logout-button"
						>
							<SignOutIcon />
						</button>
					</form>
				</div>
			</div>
		</div>
	</aside>

	<main class="chat-main">
		{@render children()}
	</main>
</div>

<style>
	.chat-container {
		display: grid;
		grid-template-columns: 300px 1fr;
		height: 100vh;
		gap: 0;
	}

	.chat-sidebar {
		border-right: 1px solid var(--bg-3);
		background-color: var(--bg-1);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.sidebar-header {
		padding: 0.3rem;
		border-bottom: 1px solid var(--bg-3);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.chat-list {
		list-style: none;
		padding: 0;
		margin: 0;
		flex: 1;
		overflow-y: auto;
	}

	.chat-item {
		border-bottom: 1px solid var(--bg-3);
	}

	.chat-link {
		display: block;
		padding: 0.75rem 1rem;
		color: var(--fg-1);
		text-decoration: none;
		transition: background-color 0.2s;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chat-link:hover {
		background-color: var(--bg-2);
	}

	.chat-link.active {
		background-color: var(--bg-2);
		font-weight: 500;
	}

	.chat-main {
		overflow-y: auto;
	}

	/* User section styles */
	.user-section {
		margin-top: auto;
		padding: 1rem;
		border-top: 1px solid var(--bg-3);
		background-color: var(--bg-2);
	}

	.user-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.user-info {
		text-align: left;
	}

	.user-name {
		font-weight: 500;
		color: var(--fg-1);
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.action-button {
		background: transparent;
		color: var(--fg-1);
		border: none;
		padding: 0.5rem;
		font-size: 1.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.action-button:hover {
		background-color: var(--bg-3);
	}

	.logout-button {
		color: #ef4444;
	}

	.logout-button:hover {
		background-color: rgba(239, 68, 68, 0.1);
	}

	/* Search bar styles */
	.search-container {
		padding: 0.75rem 0.5rem;
		border-bottom: 1px solid var(--bg-3);
	}

	.search-input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--bg-3);
		border-radius: 0.25rem;
		background-color: var(--bg-1);
		color: var(--fg-1);
		font-size: 0.875rem;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--link);
	}

	.empty-results {
		padding: 1rem;
		text-align: center;
		color: var(--fg-2);
		font-style: italic;
	}
</style>
