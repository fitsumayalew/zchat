import { writable } from 'svelte/store';

export interface ThemeState {
    isDark: boolean;
}

export const theme = writable<ThemeState>({ isDark: false });