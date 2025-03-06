<script lang="ts">
	import { page } from "$app/state";
	let newMessage = $state("");
	let messagesContainer: HTMLElement;
	let showShareDialog = $state(false);

	import { z } from "$lib/z.svelte";
	import { Query } from "zero-svelte";
	import MessageForm from "$lib/components/MessageForm.svelte";
	import ShareDialog from "$lib/components/ShareDialog.svelte";
	import MessageWithAvatar from "$lib/components/MessageWithAvatar.svelte";
	import { nanoid } from "nanoid";
	import { isSidebarCollapsed } from "$lib/stores/sidebar";


	// Create a reactive query that updates when page.params.id changes
	let chatQuery = $derived(
		z.current.query.chat
			.where("id", "=", page.params.id)
			.one()
			.related("messages", (q) => 
				q.orderBy("createdAt", "desc")
				.orderBy("role", "asc")
				.related("user", (q) => q.one())
			),
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


	let currentModelID = $derived(chat.current?.modelID);

	function handleModelSelectorChange(e: Event) {
		const temp = (e.target as HTMLSelectElement).value;
		e.preventDefault();
		z.current.mutate.chat.update({
			id: page.params.id,
			modelID: temp,
		});
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
				userMessageID,
				userMessage: newMessage,
				modelID: chat.current?.modelID,
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
	<div class="chat-header" class:sidebar-collapsed={$isSidebarCollapsed}>
		<h1>{chat.current?.title || "Chat"}</h1>
		<button class="share-button" onclick={() => showShareDialog = true}>
			Share
		</button>
	</div>

	<div class="messages-container" bind:this={messagesContainer}>
		<div class="messages">
			{#if chat.current?.messages && chat.current?.messages.length}
				{#each chat.current?.messages as message}
					<MessageWithAvatar {message} />
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
			currentModelID={currentModelID}
			models={models.current}
			bind:newMessage
			{handleSubmit}
			{handleModelSelectorChange}
			disableSendButton={
				lastAiMessage.current &&
				lastAiMessage.current?.isMessageFinished == false
			}
		/>
	</div>
</div>

{#if showShareDialog}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="dialog-overlay" onclick={() => showShareDialog = false}>
		<div class="dialog-container" onclick={(e)=>e.stopPropagation}>
			<ShareDialog
				chatID={page.params.id}
				onClose={() => showShareDialog = false}
			/>
		</div>
	</div>
{/if}

<style>
	/* Layout */
	.chat-window {
		display: flex;
		flex-direction: column;
		height: 100%;
		align-items: center;
	}

	.chat-header {
		position: fixed;
		top: 0;
		left: 300px;
		right: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--bg-1);
		border-bottom: 1px solid var(--bg-3);
		z-index: 10;
		transition: left 0.3s ease;
	}

	.chat-header.sidebar-collapsed {
		left: 0;
	}

	.chat-header h1 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.share-button {
		background: var(--bg-2);
		border: 1px solid var(--bg-3);
		color: var(--fg-1);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background-color 0.2s;
	}

	.share-button:hover {
		background: var(--bg-3);
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






	@keyframes typing {
		0%, 100% {
			opacity: 0.7;
		}
		50% {
			opacity: 0.2;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.empty-chat {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #94a3b8;
	}

	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}

	.dialog-container {
		padding: 1rem;
	}
</style>
