<script lang="ts">
	import { page } from "$app/state";
	import LightModeIcon from "$lib/icons/LightModeIcon.svelte";
	import DarkModeIcon from "$lib/icons/DarkModeIcon.svelte";
	import SignOutIcon from "$lib/icons/SignOutIcon.svelte";
	import { schema } from "../../zero.schema.js";
	import { PUBLIC_SERVER } from "$env/static/public";
	import { preload, z } from "$lib/z.svelte";
	import { Query } from "zero-svelte";
	import Button from "$lib/components/Button.svelte";
	import { goto } from "$app/navigation";
	import { theme } from "$lib/stores/theme";
	import { isSidebarCollapsed } from "$lib/stores/sidebar";

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
			.where((eb) =>
				eb.and(
					eb.cmp("title", "LIKE", `%${searchQuery}%`),
					eb.cmp("userID", "=", data.user.id),
				),
			),
	);
	const chats = $derived(new Query(chatsQuery));
</script>

<div class="chat-container">
	<aside class="chat-sidebar" class:collapsed={$isSidebarCollapsed}>
		<div class="sidebar-header">
			<div class="header-content">
				<h2>Zchat</h2>
				<div class="header-buttons">
					<Button label="New Chat" onClick={() => goto(`/chat`)} />
				</div>
			</div>
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
						onclick={() =>
							theme.update((t) => ({ isDark: !t.isDark }))}
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

	<button 
		class="collapse-button" 
		onclick={() => isSidebarCollapsed.update(v => !v)}
		aria-label={$isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
	>
		{$isSidebarCollapsed ? "→" : "←"}
	</button>

	<main class="chat-main">
		{@render children()}
	</main>
</div>

<style>
	.chat-container {
		display: grid;
		grid-template-columns: auto 1fr;
		height: 100vh;
		gap: 0;
	}

	.chat-sidebar {
		width: 300px;
		border-right: 1px solid var(--bg-3);
		background-color: var(--bg-1);
		display: flex;
		flex-direction: column;
		transition: all 0.3s ease;
		z-index: 30;
		position: relative;
		overflow: hidden;
	}

	.chat-list {
		list-style: none;
		padding: 0;
		margin: 0;
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.chat-sidebar.collapsed {
		width: 0;
		transform: translateX(-100%);
	}

	.collapse-button {
		position: fixed;
		left: 300px;
		top: 1rem;
		background: var(--bg-1);
		border: 1px solid var(--bg-3);
		border-left: none;
		color: var(--fg-1);
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0 0.25rem 0.25rem 0;
		transition: all 0.3s ease;
		z-index: 30;
	}

	.chat-sidebar.collapsed + .collapse-button {
		left: 0;
	}

	.sidebar-header {
		padding: 1rem;
		border-bottom: 1px solid var(--bg-3);
		position: sticky;
		top: 0;
		background: var(--bg-1);
		z-index: 10;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.header-content h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.header-buttons {
		flex: 1;
	}

	.header-buttons :global(.send-button) {
		width: 100%;
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
		position: relative;
		height: 100vh;
	}

	/* User section styles */
	.user-section {
		margin-top: auto;
		padding: 1rem;
		border-top: 1px solid var(--bg-3);
		background-color: var(--bg-2);
		position: sticky;
		bottom: 0;
	}

	.user-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.user-info {
		text-align: left;
		min-width: 0;
	}

	.user-name {
		font-weight: 500;
		color: var(--fg-1);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-shrink: 0;
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
		transition: all 0.2s;
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
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--bg-3);
		position: sticky;
		top: 0;
		background: var(--bg-1);
		z-index: 5;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--bg-3);
		border-radius: 0.5rem;
		background-color: var(--bg-2);
		color: var(--fg-1);
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.search-input:focus {
		border-color: var(--link);
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.empty-results {
		padding: 1rem;
		text-align: center;
		color: var(--fg-2);
		font-style: italic;
	}

	/* Mobile Styles */
	@media (max-width: 768px) {
		.chat-container {
			grid-template-columns: 1fr;
		}

		.chat-sidebar {
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			width: 100%;
			max-width: 300px;
			transform: translateX(-100%);
		}

		.chat-sidebar:not(.collapsed) {
			transform: translateX(0);
			box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
		}

		.chat-main {
			margin-left: 0;
		}

		.collapse-button {
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}

		.chat-sidebar.collapsed + .collapse-button {
			left: 0rem;
		}
	}
</style>
