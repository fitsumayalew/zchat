<script lang="ts">
    import Button from "./Button.svelte";
    import ModelSelector from "./ModelSelector.svelte";

    export let newMessage: string;
    export let models: { id: string; name: string }[];
    export let currentModelID: string | undefined = undefined;
    export let handleSubmit: (e: Event) => void;
    export let disableModelSelector: boolean = false;
    export let disableSendButton: boolean = false;
    export let handleModelSelectorChange: (e: Event) => void;
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disableSendButton) {
                // Dispatch a submit event that the parent can listen for
                handleSubmit(e);
            }
        }
    }
</script>

<form class="message-form" onsubmit={handleSubmit}>
    <!-- svelte-ignore a11y_autofocus -->
    <div class="message-input-container">
        <textarea
            bind:value={newMessage}
            placeholder="Ask anything..."
            class="message-input"
            autofocus
            onkeydown={handleKeydown}
            rows="3"
        ></textarea>
        <div class="controls-container">
            <ModelSelector
                onChange={handleModelSelectorChange}
                currentModelID={currentModelID}
                {models}
                disabled={disableModelSelector}
            />
            <Button
                label="Send"
                disabled={!newMessage.trim() || disableSendButton}
            />
        </div>
    </div>
</form>

<!-- <div class="input-container"> -->
<!-- svelte-ignore a11y_autofocus -->

<!-- </div> -->

<style>
    .message-form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0.75rem;
    }

    .controls-container {
        display: flex;
        justify-content: flex-end;
        align-items: end;
        gap: 0.75rem;
    }

    .message-input-container {
        flex: 1;
        padding: 0.75rem 1.25rem;
        border: none;
        border-radius: 1.5rem;
        outline: none;
        font-size: 1rem;
        overflow-y: auto;
        font-family: inherit;
        line-height: 1.5;
        box-sizing: border-box;
        white-space: pre-wrap;
        word-wrap: break-word;
        width: 100%;
        background-color: var(--bg-2, #e2e8f0);
        color: var(--fg-1, #334155);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }


    .message-input {
        field-sizing: content;
        width: 100%;
        border: none;
        resize: none;
        min-height: 1.5rem;
        max-height: 10rem;
        height: auto;
        background-color: transparent;
        color: inherit;
        outline: none;
        font-size: 1rem;
        overflow-y: auto;
    }

    .message-input::placeholder {
        color: var(--fg-2, #4d4d4d);
        opacity: 0.7;
    }
</style>
