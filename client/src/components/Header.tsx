import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Cart from "./Cart";

const Header = () => {
  const [showCart, setShowCart] = useState(false);
  const totalQuantity = useSelector((state: RootState) => state.cart.totalQuantity);

  return (
    <header>
      <h2>Mon Shop</h2>
      <button onClick={() => setShowCart(!showCart)}>
        Panier ({totalQuantity})
      </button>
      {showCart && <Cart showCart={showCart} setShowCart={setShowCart} />}
    </header>
  );
};

export default Header;
