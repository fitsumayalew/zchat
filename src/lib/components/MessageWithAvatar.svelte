<script lang="ts">
    import { marked } from "marked";

    type MessageType = {
        role: string,
        content: string,
        user?: {
            id: string,
            name: string
        }
        isMessageFinished: boolean|null
    };
    export let message: MessageType;

    function getUserColor(userId: string): string {
        const colors = [
            '#2563eb', // blue-600
            '#7c3aed', // violet-600
            '#db2777', // pink-600
            '#ea580c', // orange-600
            '#16a34a', // green-600
            '#4f46e5', // indigo-600
            '#9333ea', // purple-600
            '#e11d48', // rose-600
            '#0891b2', // cyan-600
            '#ca8a04'  // yellow-600
        ];
        
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = ((hash << 5) - hash) + userId.charCodeAt(i);
            hash = hash & hash;
        }
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }
</script>

<div class={message.role === "user" ? "user-message-container" : "assistant-message"}>
    {#if message.role === "user"}
        <div class="message-with-avatar">
            <div 
                class="user-message"
                style="background-color: {message.user?.id ? getUserColor(message.user.id) : '#3b82f6'}"
            >
                <div class="message-content">
                    {message.content}
                </div>
            </div>
            <div class="avatar-container">
                <div 
                    class="avatar"
                    style="background-color: {message.user?.id ? getUserColor(message.user.id) : '#1d4ed8'}"
                >
                    {message.user?.name?.[0].toUpperCase()}
                </div>
                <div class="tooltip">
                    {message.user?.name}
                </div>
            </div>
        </div>
    {:else}
        <div class="assistant-message-content">
            <span
                class="message-text"
                class:typing={!message.isMessageFinished}
            >
                {@html marked(message.content)}
            </span>
        </div>
    {/if}
</div>

<style>
    .user-message-container {
        align-self: flex-end;
        max-width: 80%;
    }

    .message-with-avatar {
        display: flex;
        align-items: start;
        gap: 0.75rem;
    }

    .user-message {
        color: white;
        border-radius: 1.5rem;
        padding: 0.75rem 1rem;
        order: 1;
        margin: 0.25rem 0;
    }

    .avatar-container {
        position: relative;
        order: 2;
        height: 2rem;
        margin-top: 0.6rem;
    }

    .avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: help;
        flex-shrink: 0;
        color: white;
    }

    .tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transform: translateY(-100%);
        top: -0.5rem;
        right: 0;
        transition: opacity 0.2s;
    }

    .avatar-container:hover .tooltip {
        opacity: 1;
    }

    .message-content {
        white-space: pre-wrap;
    }

    .assistant-message {
        align-self: flex-start;
        color: var(--text-color);
        align-items: start;
        text-align: justify;
        text-justify: inter-word;
        max-width: 80%;
    }

    .message-text {
        display: block;
    }

    .message-text :global(p:last-of-type),
    .message-text :global(ul:last-child > li:last-child),
    .message-text :global(ol:last-child > li:last-child) {
        display: inline-block;
        opacity: 0;
        animation: fadeIn 0.3s ease-out forwards;
    }

    .message-text.typing :global(p:last-of-type)::after,
    .message-text.typing :global(ol:last-child > li:last-child)::after,
    .message-text.typing :global(ul:last-child > li:last-child)::after {
        content: "●";
        font-family: system-ui, sans-serif;
        margin-left: 0.4em;
        font-size: 0.7em;
        line-height: normal;
        vertical-align: baseline;
        animation: typing 1s infinite ease-in-out;
        opacity: 0.7;
    }

    .message-text.typing :global(ol:last-child),
    .message-text.typing :global(ul:last-child) {
        display: block;
        margin-bottom: 0;
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
</style> 