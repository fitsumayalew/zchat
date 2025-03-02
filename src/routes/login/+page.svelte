<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';
	import Button from "$lib/components/Button.svelte";
	import MessageIcon from "$lib/icons/MessageIcon.svelte";

	export let form: ActionData;
	
	let loading = false;
	
	function handleSubmit() {
		loading = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			loading = false;
		};
	}
</script>

<svelte:head>
	<title>Login to ZChat</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<h1>
				<span class="logo">
					<MessageIcon />
				</span>
				ZChat
			</h1>
			<p>Please login to continue</p>
		</div>

		<form method="post" use:enhance={handleSubmit}>
			<div class="form-group">
				<label for="email">Email</label>
				<input type="email" name="email" id="email" placeholder="your@email.com" required />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" name="password" id="password" placeholder="••••••••" required />
			</div>

			{#if form?.error}
				<div class="notice error">
					{form.error}
				</div>
			{/if}

			<div class="auth-button-container">
				<Button 
					label={loading ? "Logging in..." : "Login"} 
					disabled={loading} 
				/>
			</div>
		</form>

		<div class="auth-footer">
			<p>Don't have an account? <a href="/signup">Sign Up</a></p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 1rem;
		box-sizing: border-box;
	}

	.auth-card {
		background-color: var(--bg-1);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		margin: auto;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}
	
	.logo {
		display: inline-block;
		width: 28px;
		height: 28px;
		vertical-align: middle;
		margin-right: 0.5rem;
	}

	.auth-header h1 {
		margin-bottom: 0.25rem;
		font-size: 1.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.auth-header p {
		color: var(--fg-2);
		margin-top: 0;
		font-size: 0.9rem;
	}

	.form-group {
		margin-bottom: 0.75rem;
		width: 100%;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.25rem;
		font-weight: 500;
	}

	.form-group input {
		width: 100%;
		padding: 0.6rem;
		border: 1px solid var(--bg-3);
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
		background-color: var(--bg-2);
	}

	form {
		width: 100%;
	}

	.auth-footer {
		text-align: center;
		margin-top: 1rem;
	}

	.notice.error {
		background-color: #ffebee;
		color: #c62828;
		padding: 0.6rem;
		border-radius: 4px;
		margin-bottom: 0.75rem;
	}

	.auth-button-container {
		width: 100%;
	}

	.auth-button-container :global(.send-button) {
		width: 100%;
		height: 2.75rem;
		border-radius: 6px;
		font-size: 1rem;
	}
</style>