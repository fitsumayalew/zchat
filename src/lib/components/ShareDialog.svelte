<script lang="ts">
    import { z } from "$lib/z.svelte";
    import { Query } from "zero-svelte";
    import Button from "./Button.svelte";

    let { chatID, onClose } = $props<{
        chatID: string;
        onClose: () => void;
    }>();

    let buttonLabel = $state("Copy Link");
    let isCopying = $state(false);
    let isUpdating = $state(false);
    let error = $state<string | null>(null);

    const chatQuery = $derived(
        z.current.query.chat
            .where("id", "=", chatID)
            .one()
    );
    const chat = $derived(new Query(chatQuery));

    const shareUrl = $derived(
        `${window.location.origin}/shared/chat/${chatID}`
    );

    async function handleUpdateAccess(field: 'isChatPublicRead' | 'isChatPublicWrite', value: boolean) {
        try {
            isUpdating = true;
            error = null;
            
            if (field === 'isChatPublicRead' && !value) {
                await z.current.mutate.chat.update({
                    id: chatID,
                    isChatPublicRead: false,
                    isChatPublicWrite: false,
                });
            } else {
                await z.current.mutate.chat.update({
                    id: chatID,
                    [field]: value,
                });
            }
        } catch (e) {
            error = "Failed to update sharing settings. Please try again.";
            console.error("Error updating access:", e);
        } finally {
            isUpdating = false;
        }
    }

    async function handleCopyLink() {
        try {
            isCopying = true;
            error = null;
            await navigator.clipboard.writeText(shareUrl);
            buttonLabel = "Copied!";
            setTimeout(() => {
                buttonLabel = "Copy Link";
            }, 2000);
        } catch (e) {
            error = "Failed to copy link. Please try again.";
            console.error("Error copying to clipboard:", e);
        } finally {
            isCopying = false;
        }
    }
</script>

<div 
    class="share-dialog" 
    role="dialog" 
    aria-labelledby="share-dialog-title"
    aria-describedby="share-dialog-description"
    on:click|stopPropagation
>
    <div class="share-dialog-header">
        <h2 id="share-dialog-title">Share Chat</h2>
        <button 
            class="close-button" 
            on:click={onClose}
            aria-label="Close dialog"
        >&times;</button>
    </div>

    <div id="share-dialog-description" class="share-options">
        <div class="share-option">
            <label class="checkbox-label">
                <input
                    type="checkbox"
                    checked={chat.current?.isChatPublicRead}
                    on:change={(e) => handleUpdateAccess('isChatPublicRead', e.currentTarget.checked)}
                    disabled={isUpdating}
                    aria-label="Share publicly"
                />
                Share publicly
            </label>
            <p class="description">Make this chat accessible to others</p>
        </div>

        {#if chat.current?.isChatPublicRead}
            <div class="share-option sub-option">
                <label class="checkbox-label">
                    <input
                        type="checkbox"
                        checked={chat.current?.isChatPublicWrite}
                        on:change={(e) => handleUpdateAccess('isChatPublicWrite', e.currentTarget.checked)}
                        disabled={isUpdating}
                        aria-label="Allow others to send messages"
                    />
                    Allow others to send messages
                </label>
                <p class="description">Anyone with the link can send messages (requires sign in)</p>
            </div>
        {/if}
    </div>

    {#if error}
        <div class="error-message" role="alert">
            {error}
        </div>
    {/if}

    {#if chat.current?.isChatPublicRead}
        <div class="share-link">
            <p class="share-url" aria-label="Share URL">{shareUrl}</p>
            <Button
                label={buttonLabel}
                onClick={handleCopyLink}
                disabled={isCopying}
            />
        </div>
    {/if}
</div>

<style>
    .share-dialog {
        background: var(--bg-1);
        border-radius: 8px;
        padding: 1.5rem;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    .share-dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .share-dialog-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        color: var(--fg-1);
        transition: color 0.2s ease;
    }

    .close-button:hover {
        color: var(--fg-2);
    }

    .share-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .share-option {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .sub-option {
        margin-left: 1.5rem;
        padding-left: 1rem;
        border-left: 2px solid var(--bg-3);
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
        cursor: pointer;
    }

    .checkbox-label input[type="checkbox"]:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }

    .description {
        margin: 0;
        font-size: 0.875rem;
        color: var(--fg-2);
        padding-left: 1.75rem;
    }

    .share-link {
        background: var(--bg-2);
        border: 1px solid var(--bg-3);
        border-radius: 4px;
        padding: 1rem;
        display: flex;
        gap: 1rem;
        align-items: center;
        transition: border-color 0.2s ease;
    }

    .share-link:focus-within {
        border-color: var(--accent-1);
        outline: 2px solid var(--accent-1);
        outline-offset: -2px;
    }

    .share-url {
        margin: 0;
        flex: 1;
        font-family: monospace;
        font-size: 0.875rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .error-message {
        background: var(--error-bg);
        color: var(--error-fg);
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        font-size: 0.875rem;
    }
</style> 