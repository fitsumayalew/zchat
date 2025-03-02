<script lang="ts">
    export let currentModelID: string | undefined = undefined;
    export let models: {id: string, name: string}[];
    export let disabled: boolean = false;
</script>

<select
    value={currentModelID}
    class="model-select"
    aria-label="Select AI model"
    disabled={disabled}
>
    {#each models as model}
        <option value={model.id}>{model.name}</option>
    {/each}
</select>

<style>
    .model-select {
        max-width: 12rem;
        border-radius: 0.75rem;
        background-color: var(--bg-1, #f8fafc);
        color: var(--fg-1, #334155);
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--bg-3, #e2e8f0);
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .model-select:focus {
        border-color: var(--link, #1c7ed4);
        outline: none;
        box-shadow: 0 0 0 2px rgba(28, 126, 212, 0.2);
    }

    .model-select:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    /* Ensure dark mode compatibility */
    @media (prefers-color-scheme: dark) {
        :global(html:not(.light)) .model-select {
            background-color: var(--bg-1, #2e2e2e);
            color: var(--fg-1, #e6e6e6);
            border-color: var(--bg-3, #666);
        }
        
        :global(html:not(.light)) .model-select:focus {
            border-color: var(--link-active, #4baffb);
            box-shadow: 0 0 0 2px rgba(75, 175, 251, 0.2);
        }
    }
</style>
