<script lang="ts">
	import { Query } from "zero-svelte";
	import { z } from "$lib/z.svelte";
	import { goto } from "$app/navigation";
	import MessageForm from "$lib/components/MessageForm.svelte";


	let modelsQuery = z.current.query.model;
	let models = new Query(modelsQuery);


	let newMessage = $state("");
	let currentModelID = $derived(models.current[0]?.id);


	async function handleSubmit(e: Event) {
		e.preventDefault();
		try {
			fetch("/api/chat/new", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userMessage: newMessage,
					modelID: currentModelID,
				}),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.error) {
						console.error("Error sending message:", data.error);
						return;
					}
					goto(`/chat/${data.chatID}`);
				})
				.catch((error) => {
					console.error("Error sending message:", error);
				});

		} catch (error) {
			console.error(error);
		}
	}

</script>

<div class="welcome-container">
	<h1>Welcome to ZChat</h1>
	<p>Select a conversation from the sidebar or start a new one below.</p>

	<div class="message-form-container">
		<MessageForm models={models.current} bind:newMessage {handleSubmit} currentModelID={currentModelID}/>
	</div>
</div>

<style>
	.welcome-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		max-width: 500px;
		margin: 0 auto;
		height: 100%;
	}

	.message-form-container {
		width: 100%;
		max-width: 48rem;
		margin-bottom: 1rem;
	}
</style>
