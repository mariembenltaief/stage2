// src/pages/Produits.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cartActions } from "../store/CartSlice";
import type { RootState } from "../store/store";
import Layout from "../components/Layout";
import { useLocation } from "react-router-dom";

import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  photo?: string;
  category_name?: string;
  category_description?: string;
  quantity?: number;
}

const Produits: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userId = params.get("userId"); // récupère l’ID admin

  // Calcul du total du panier
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  // Vider le panier à chaque changement de userId/admin
  useEffect(() => {
    dispatch(cartActions.clearCart());
  }, [userId, dispatch]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = "http://localhost:3001/produit";
        if (userId) url += `?userId=${userId}`; // filtrer par admin

        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data)) setProducts(data);
        else if (data.success && Array.isArray(data.data)) setProducts(data.data);
        else {
          console.error("Format de réponse inattendu:", data);
          setProducts([]);
          setErrorMsg("Réponse backend inattendue (voir console).");
        }
      } catch (err: any) {
        console.error("Erreur fetch produits:", err);
        setErrorMsg(err.message || "Erreur lors de la récupération des produits");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userId]);

  const addToCart = (product: Product) => {
    dispatch(cartActions.addToCart({ ...product, quantity: 1 }));
  };

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Nos Produits
      </Typography>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
          <CircularProgress />
        </div>
      )}

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {!loading && products.length === 0 && !errorMsg && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Aucun produit trouvé.
        </Alert>
      )}

      {/* Grid Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {products.map((p) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {p.photo ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:3001/uploads/${p.photo}`}
                  alt={p.name}
                  sx={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f5f5f5",
                  }}
                >
                  <Typography variant="subtitle1">Pas d'image</Typography>
                </div>
              )}

              <CardContent>
                <Typography variant="h6">{p.name}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minHeight: 48 }}
                >
                  {p.description || "Pas de description disponible."}
                </Typography>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <Typography variant="h6">{p.price}$</Typography>
                  <Button variant="contained" onClick={() => addToCart(p)}>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tableau des produits avec catégories */}
      {!loading && products.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom Produit</TableCell>
                <TableCell>Prix ($)</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Description Catégorie</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.price}</TableCell>
                  <TableCell>{p.category_name || "-"}</TableCell>
                  <TableCell>{p.category_description || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6">Total panier: ${totalAmount}</Typography>
    </Layout>
  );
};

export default Produits;
