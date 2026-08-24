import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  sellerId: string;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  hydrate: (items: CartItem[]) => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? {
                    ...i,
                    id: item.id || i.id,
                    quantity: Math.min(item.quantity ?? i.quantity, i.maxQuantity),
                  }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity ?? 1 }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      hydrate: (items) => set({ items }),

      itemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    { name: "agrotech-cart" }
  )
);
