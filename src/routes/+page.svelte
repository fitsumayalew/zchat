<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	
	// Redirect to login page when the component mounts
	if (browser) {
		goto('/login');
	}
</script>

<div class="loading-container">
	<h1>Welcome to ZChat</h1>
	<p>Redirecting to app...</p>
</div>

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		height: 100vh;
	}
</style>
