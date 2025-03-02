<script lang="ts">
    export let label: string;
    export let onClick: (() => void) | undefined = undefined;
    export let disabled: boolean = false;
</script>

<button type="submit" on:click={onClick} class="send-button" disabled={disabled}>
    {label}
</button>

<style>
    .send-button {
        min-width: 6rem;
        height: 2.5rem;
        background-color: var(--link, #1c7ed4);
        color: white;
        border: none;
        border-radius: 1.25rem;
        cursor: pointer;
        transition:
            background-color 0.2s ease,
            transform 0.1s ease,
            box-shadow 0.2s ease;
        font-weight: 500;
        padding: 0 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .send-button:hover:not(:disabled) {
        background-color: var(--link-hover, #3492e5);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }

    .send-button:active:not(:disabled) {
        transform: scale(0.95);
        background-color: var(--link-active, #176bb5);
    }

    .send-button:disabled {
        background-color: var(--bg-3, #e2e8f0);
        color: var(--fg-2, #4d4d4d);
        cursor: not-allowed;
        opacity: 0.7;
        box-shadow: none;
    }

    /* Ensure dark mode compatibility */
    @media (prefers-color-scheme: dark) {
        :global(html:not(.light)) .send-button {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        :global(html:not(.light)) .send-button:hover:not(:disabled) {
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
        }
        
        :global(html:not(.light)) .send-button:disabled {
            background-color: var(--bg-3, #666);
            color: var(--fg-2, #b3b3b3);
        }
    }
</style>
