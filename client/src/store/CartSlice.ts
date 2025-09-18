import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Définition d'un item dans le panier
interface CartItem {
  id: number;
  name: string;
  price: number;   // correspond au backend
  photo?: string;
  quantity: number;
}

// État du panier
interface CartState {
  cartItems: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

const initialState: CartState = {
  cartItems: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const item = action.payload;
      const exist = state.cartItems.find(i => i.id === item.id);
      if (exist) {
        exist.quantity += item.quantity;
      } else {
        state.cartItems.push(item);
      }
      state.totalQuantity = state.cartItems.reduce((sum, i) => sum + i.quantity, 0);
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.cartItems = state.cartItems.filter(i => i.id !== action.payload);
      state.totalQuantity = state.cartItems.reduce((sum, i) => sum + i.quantity, 0);
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    },
    clearCart(state) {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;
