import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeStoreInterface } from "@/types/typos.bd";

export const useThemeStore = create<ThemeStoreInterface>()(persist(
    (set, get) => ({
        theme: 'light',
        toggleTheme: () => {
            const nextTheme = get().theme === "light" ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', nextTheme === "dark")
            set({theme: nextTheme});
        },
    }),
    {
        name: 'stockGuard-theme',
        onRehydrateStorage: () => (state) => {
            if (state) {
                document.documentElement.classList.toggle('dark', state.theme === 'dark')
            };
        },
    }
))