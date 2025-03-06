<script lang="ts">
	import { Query } from "zero-svelte";
	import { z } from "$lib/z.svelte";
	import { goto } from "$app/navigation";
	import MessageForm from "$lib/components/MessageForm.svelte";
	import { nanoid } from "nanoid";
	import { getRawJwt } from "$lib/cookie";
	import { page } from "$app/state";

	let modelsQuery = z.current.query.model;
	let models = new Query(modelsQuery);

	let newMessage = $state("");
	let currentModelID = $state('hsQf89_ReWM9BCBWiDrg3');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		try {
			const chatID = nanoid();
			const userMessageID = nanoid();

			await z.current.mutateBatch(async (tx) => {
				tx.chat.insert({
					id: chatID,
					userID: page.data.user.id,
					modelID: currentModelID,
					createdAt: new Date().getTime(),
				});

				tx.message.insert({
					id: userMessageID,
					chatID,
					userID: page.data.user.id,
					role: "user",
					content: newMessage,
					isMessageFinished: true,
					createdAt: new Date().getTime(),
				});
			});

			const aiMessageID = nanoid();

			await z.current.mutate.message.insert({
				id: aiMessageID,
				chatID,
				userID: page.data.user.id,
				role: "assistant",
				content: "",
				isMessageFinished: false,
				createdAt: new Date().getTime(),

			});

			fetch("/api/chat/new", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chatID,
					userMessage: newMessage,
					aiMessageID,
					modelID: currentModelID,
				}),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.error) {
						console.error("Error sending message:", data.error);
						return;
					}
				})
				.catch((error) => {
					console.error("Error sending message:", error);
				});
			goto(`/chat/${chatID}`);
		} catch (error) {
			console.error(error);
		}
	}

	function handleModelSelectorChange(e: Event) {
		e.preventDefault();
		currentModelID = (e.target as HTMLSelectElement).value;
	}
</script>

<div class="welcome-container">
	<h1>Welcome to ZChat</h1>
	<p>Select a conversation from the sidebar or start a new one below.</p>

	<div class="message-form-container">
		<MessageForm
			models={models.current}
			bind:newMessage
			{handleSubmit}
			bind:currentModelID
			{handleModelSelectorChange}
		/>
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
