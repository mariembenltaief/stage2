import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { cartActions } from "../store/CartSlice";
import { RootState } from "../store/store";

interface CartProps {
  showCart: boolean;
  setShowCart: (b: boolean) => void;
}

const Cart: React.FC<CartProps> = ({ showCart, setShowCart }) => {
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const dispatch = useDispatch();

  const totalAmount = cartItems.reduce((sum, item) => sum + item.prix * item.quantity, 0);

  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 400, height: "100%", background: "white", zIndex: 100 }}>
      <button onClick={() => setShowCart(false)}>X</button>
      {cartItems.length === 0 ? (
        <p>Panier vide</p>
      ) : (
        cartItems.map(item => (
          <div key={item.id}>
            {item.Nom} x {item.quantity} - ${item.prix * item.quantity}
            <button onClick={() => dispatch(cartActions.removeFromCart(item.id))}>x</button>
          </div>
        ))
      )}
      <div>Total: ${totalAmount}</div>
    </div>
  );
};

export default Cart;
