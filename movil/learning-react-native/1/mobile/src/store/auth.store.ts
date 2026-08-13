import { create } from "zustand";
import { tokenStorage, userIdStorage } from "@/utils/secureStorage";
import type { AuthStoreHelper } from "@/types/typos";
// heredamos de AuthStoreHelper para incluir isHydrated y su funcion booleano
interface AuthStore extends AuthStoreHelper {
  isHydrated: boolean;
  hydrate: () => Promise<void>;
}
/**
 * auth store hydrate->recargamos los datos del usuario; login->establecemos los datos que recibimos del
 * usuario al hacer el rest; logout->borramos datos del usuario; checkauth->chequeamos si el usuario aun
 * esta logeado
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  isAutenticated: false,
  token: null,
  userId: null,
  isHydrated: false,

  hydrate: async () => {
    const [token, userId] = await Promise.all([
      tokenStorage.get(),
      userIdStorage.get(),
    ]);
    set({
      token,
      userId,
      isAutenticated: Boolean(token && userId),
      isHydrated: true,
    });
  },

  login: (token, userId) => {
    tokenStorage.set(token);
    userIdStorage.set(userId);
    set({ token, userId, isAutenticated: true });
  },

  logout: () => {
    tokenStorage.remove();
    userIdStorage.remove();
    set({ token: null, userId: null, isAutenticated: false });
  },

  checkAuth: () => get().isAutenticated,
}));