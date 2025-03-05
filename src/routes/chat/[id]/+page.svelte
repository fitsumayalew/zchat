<script lang="ts">
	import { page } from "$app/state";
	import { marked } from "marked";
	let newMessage = $state("");
	let messagesContainer: HTMLElement;

	import { z } from "$lib/z.svelte";
	import { Query } from "zero-svelte";
	import MessageForm from "$lib/components/MessageForm.svelte";
	import { nanoid } from "nanoid";

	// Create a reactive query that updates when page.params.id changes
	let chatQuery = $derived(
		z.current.query.chat
			.where("id", "=", page.params.id)
			.one()
			.related("messages", (q) => q.orderBy("createdAt", "desc")),
	);
	let chat = $derived(new Query(chatQuery));


	let lastAiMessageQuery = $derived(
		z.current.query.message
			.where("chatID", "=", page.params.id)
			.where("role", "=", "assistant")
			.orderBy("createdAt", "desc")
			.limit(1)
			.one(),
	);

	let lastAiMessage = $derived(new Query(lastAiMessageQuery));

	let modelsQuery = z.current.query.model;
	let models = new Query(modelsQuery);

	// Listen for the submit event from the MessageTextArea
	function handleMessageSubmit() {
		if (newMessage.trim()) {
			submitMessage();
		}
	}

	// Add event listener for the custom submit event
	$effect(() => {
		document.addEventListener("submit", handleMessageSubmit);
		return () => {
			document.removeEventListener("submit", handleMessageSubmit);
		};
	});

	async function submitMessage() {
		if (!newMessage.trim()) return;

		const userMessageID = nanoid();
		const aiMessageID = nanoid();

		await z.current.mutate.message.insert({
			id: userMessageID,
			chatID: page.params.id,
			userID: page.data.user.id,
			role: "user",
			content: newMessage,
			isMessageFinished: true,
			createdAt: new Date().getTime(),
		});

		newMessage = "";
		await z.current.mutate.message.insert({
			id: aiMessageID,
			chatID: page.params.id,
			userID: page.data.user.id,
			role: "assistant",
			content: "",
			isMessageFinished: false,
			createdAt: new Date().getTime(),

		});
		fetch("/api/chat/send_message", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				chatID: page.params.id,
				aiMessageID,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					console.error("Error sending message:", data.error);
					return;
				}

				// Clear the input since we're using the Query component for messages now
			})
			.catch((error) => {
				console.error("Error sending message:", error);
			});
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (lastAiMessage.current?.isMessageFinished) {
			submitMessage();
		}
	}
</script>

<div class="chat-window">
	<div class="messages-container" bind:this={messagesContainer}>
		<div class="messages">
			{#if chat.current?.messages && chat.current?.messages.length}
				{#each chat.current?.messages as message}
					<div
						class={message.role === "user"
							? "user-message"
							: "assistant-message"}
					>
						<div class="message-content">
							{#if message.role === "user"}
								{message.content}
							{:else}
								{@html marked(message.content)}
							{/if}
						</div>
					</div>
				{/each}
			{:else}
				<div class="empty-chat">
					<p>No messages yet. Start the conversation!</p>
				</div>
			{/if}
		</div>
	</div>

	<div class="message-form-container">
		<MessageForm
			currentModelID={chat.current?.modelID}
			models={models.current}
			bind:newMessage
			{handleSubmit}
			disableModelSelector={true}
			disableSendButton={
				lastAiMessage.current &&
				lastAiMessage.current?.isMessageFinished == false
			}
		/>
	</div>
</div>

<style>
	/* Layout */
	.chat-window {
		display: flex;
		flex-direction: column;
		height: 100%;
		align-items: center;
	}

	.messages-container {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		scrollbar-gutter: stable;
		width: 100%;
		flex: 1;
		margin-bottom: 1rem;
		margin-top: 4rem;
		align-items: center;
		flex-direction: column-reverse;
		scroll-snap-type: y mandatory;
		padding: 0rem;
	}

	.messages {
		display: flex;
		flex-direction: column-reverse;
		min-height: min-content;
		max-width: 48rem;
		width: 100%;
	}

	.message-form-container {
		width: 100%;
		max-width: 48rem;
		margin-bottom: 1rem;
	}

	.user-message {
		background-color: #3b82f6;
		color: white;
		border-radius: 1.5rem;
		padding: 0.75rem 1rem;
		align-self: flex-end;
		justify-self: flex-end;
		max-width: 80%;
	}

	.assistant-message {
		align-self: flex-start;
		color: var(--text-color);
		align-items: start;
		text-align: justify;
		text-justify: inter-word;
	}

	.empty-chat {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #94a3b8;
	}
</style>
