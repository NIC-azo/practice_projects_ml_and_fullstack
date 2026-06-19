import {create} from "zustand";
import type {AuthStoreInterface} from "@/types/typos.bd"

export const useAuthStore = create<AuthStoreInterface>((set) => ({
    token: null,
    user: null,
    isAutenticated: false,
    login: (token, user) => {
        localStorage.setItem("stockGuard-token", token);
        localStorage.setItem("stockGuard-user", JSON.stringify(user));
        set({user, token, isAutenticated: true})
    },
    logout: () => {
        localStorage.removeItem("stockGuard-token");
        set({token: null, user: null, isAutenticated: false})
    },
    checkAuth: () => {
        const token = localStorage.getItem("stockGuard-token");
        const userStr = localStorage.getItem("stockGuard-user");
        if (token && userStr) {
            const user = JSON.parse(userStr);
            set({user, token, isAutenticated: true})
            return true;
        }
        return false;
    },
}));
