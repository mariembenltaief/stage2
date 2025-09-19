import React, { ReactNode, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { cartActions } from "../store/CartSlice";

interface LayoutProps {
  children: ReactNode;
}

const footerHeight = 64;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [openCart, setOpenCart] = useState(false);

  const dispatch = useDispatch();

  // Récupérer les produits du panier depuis Redux
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const totalQuantity = useSelector((state: RootState) => state.cart.totalQuantity);
  const totalAmount = useSelector((state: RootState) => state.cart.totalAmount);

  const handleRemoveItem = (id: number) => {
    dispatch(cartActions.removeFromCart(id));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar */}
      <AppBar position="fixed">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Dashboard</Typography>

          <Box>
            {/* Panier */}
            <IconButton color="inherit" onClick={() => setOpenCart(true)}>
              <Badge badgeContent={totalQuantity} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Compte */}
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Panier */}
      <Drawer anchor="right" open={openCart} onClose={() => setOpenCart(false)}>
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            🛒 Mon Panier
          </Typography>
          <Divider />

          {cartItems.length === 0 ? (
            <Typography sx={{ mt: 2 }}>Votre panier est vide.</Typography>
          ) : (
            <List>
              {cartItems.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ListItemText
                    primary={item.name}
                    secondary={`Prix: ${item.price} € | Qté: ${item.quantity}`}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    ❌
                  </Button>
                </ListItem>
              ))}
            </List>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Total: {totalAmount} €</Typography>

          {cartItems.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => {
                alert("Commande validée !");
                dispatch(cartActions.clearCart());
                setOpenCart(false);
              }}
            >
              Passer la commande
            </Button>
          )}
        </Box>
      </Drawer>

      {/* Contenu */}
      <Box
        sx={{
          flexGrow: 1,
          paddingTop: "80px",
          paddingBottom: `${footerHeight}px`,
          px: 3,
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${footerHeight}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1976d2",
          color: "white",
          textAlign: "center",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} - Dashboard MUI | Tous droits réservés
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
