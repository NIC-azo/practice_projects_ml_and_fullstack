import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = process.env["EXPO_PUBLIC_TOKEN_KEY"] ?? "";
const USER_KEY = process.env["EXPO_PUBLIC_USER_KEY"] ?? "";

export const tokenStorage = {
  async get(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
  async set(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async remove(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

export const userIdStorage = {
  async get(): Promise<string | null> {
    return await SecureStore.getItemAsync(USER_KEY);
  },
  async set(userId: string): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, userId);
  },
  async remove(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
