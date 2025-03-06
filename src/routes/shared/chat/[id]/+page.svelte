<script lang="ts">
    import { page } from "$app/state";
    import { marked } from "marked";
    import { z } from "$lib/z.svelte";
    import { Query } from "zero-svelte";
    import MessageForm from "$lib/components/MessageForm.svelte";
    import MessageWithAvatar from "$lib/components/MessageWithAvatar.svelte";
    import { nanoid } from "nanoid";
    import { untrack } from "svelte";

    let newMessage = $state("");
    let messagesContainer: HTMLElement;

    // Create a reactive query that updates when page.params.id changes
    let chatQuery = $derived(
        z.current.query.chat
            .where("id", "=", page.params.id)
            .one()
            .related("messages", (q) =>
                q
                    .orderBy("createdAt", "desc")
                    .orderBy("role", "asc")
                    .related("user", (q) => q.one()),
            ),
    );
    let chat = $derived(new Query(chatQuery));
    let currentModelID = $derived(chat.current?.modelID);


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

    
    function handleModelSelectorChange(e: Event) {
		const temp = (e.target as HTMLSelectElement).value;
		e.preventDefault();
		z.current.mutate.chat.update({
			id: page.params.id,
			modelID: temp,
		});
	}

    async function submitMessage() {
        if (!newMessage.trim() || !page.data.user) return;

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

    // Scroll to bottom when messages change
    $effect(() => {
        if (messagesContainer && chat.current?.messages) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
</script>

<div class="shared-chat">
    <header class="chat-header">
        <h1>{chat.current?.title || "Chat"}</h1>
        {#if !page.data.user && chat.current?.isChatPublicWrite}
            <a href="/login" class="login-button">Sign in to write messages</a>
        {/if}
    </header>

    <div class="messages-container" bind:this={messagesContainer}>
        <div class="messages">
            {#if chat.current?.messages && chat.current?.messages.length}
                {#each chat.current?.messages as message}
                    <MessageWithAvatar {message} />
                {/each}
            {:else}
                <div class="empty-chat">
                    <p>No messages yet.</p>
                </div>
            {/if}
        </div>
    </div>

    {#if (chat.current?.isChatPublicWrite || page.data.isOwner) && page.data.user}
        <div class="message-form-container">
            <MessageForm
                currentModelID={currentModelID}
                models={models.current}
                bind:newMessage
                {handleSubmit}
                disableSendButton={lastAiMessage.current &&
                    lastAiMessage.current?.isMessageFinished == false}
                handleModelSelectorChange={handleModelSelectorChange}
            />
        </div>
    {/if}
</div>

<style>
    .shared-chat {
        display: flex;
        flex-direction: column;
        height: 100vh;
        max-width: 48rem;
        margin: 0 auto;
        padding: 0 1rem;
    }

    .chat-header {
        position: sticky;
        top: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        background: var(--bg-1);
        border-bottom: 1px solid var(--bg-3);
        margin-bottom: 1rem;
        z-index: 10;
    }

    .chat-header h1 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .login-button {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: var(--bg-2);
        color: var(--fg-1);
        text-decoration: none;
        border-radius: 4px;
        font-size: 0.875rem;
        transition: background-color 0.2s;
    }

    .login-button:hover {
        background: var(--bg-3);
    }

    .messages-container {
        flex: 1;
        padding: 0 1.5rem;
        overflow-y: auto;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-direction: column-reverse;
        scroll-snap-type: y mandatory;
    }

    .messages {
        display: flex;
        flex-direction: column-reverse;
        min-height: min-content;
        max-width: 48rem;
        width: 100%;
    }



    
    @keyframes typing {
        0%,
        100% {
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
        text-align: center;
        color: var(--fg-2);
        padding: 2rem;
    }

    .message-form-container {
        position: sticky;
        bottom: 0;
        background: var(--bg-1);
        padding: 1rem 0;
        border-top: 1px solid var(--bg-3);
    }

  
</style>
