import {create} from "zustand";
import type {AuthStoreInterface, UserForTypos} from "@/types/typos.bd"

const getInitialToken = (): string | null => localStorage.getItem("stockGuard-token");
const getInitialUser = (): UserForTypos | null => {
    const userStr = localStorage.getItem("stockGuard-user");
    return userStr ? JSON.parse(userStr) : null;
};

export const useAuthStore = create<AuthStoreInterface>((set) => ({
    token: getInitialToken(),
    user: getInitialUser(),
    isAutenticated: Boolean(getInitialToken() && getInitialUser()),
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
