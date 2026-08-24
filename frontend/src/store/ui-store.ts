import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  cartDrawerOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCartDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  cartDrawerOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setCartDrawerOpen: (cartDrawerOpen) => set({ cartDrawerOpen }),
}));
