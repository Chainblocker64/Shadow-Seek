import { create } from "zustand";
import { getAuthenticatedUser, AuthenticatedUser } from "../auth";

interface AuthState {
  user: AuthenticatedUser | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: AuthenticatedUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    set({ loading: true });
    try {
      const userData = await getAuthenticatedUser();
      set({ user: userData ?? null, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, loading: false }),
}));

if (typeof window !== "undefined") {
  useAuthStore.getState().fetchUser();
}
