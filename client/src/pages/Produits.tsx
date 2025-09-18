// src/pages/Produits.tsx  (ou ton emplacement actuel)
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cartActions } from "../store/CartSlice";
import type { RootState } from "../store/store";
import Layout from "../components/Layout";

import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  photo?: string;
  quantity?: number;
}

const Produits: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:4000/produit");
        const data = await res.json();
        console.log("fetch /produit status", res.status, data);

        // Gestion robuste des formats de réponse
        if (Array.isArray(data)) {
          setProducts(data);
          setErrorMsg(null);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
          setErrorMsg(null);
        } else if (Array.isArray(data.produits)) {
          setProducts(data.produits);
          setErrorMsg(null);
        } else if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
          setErrorMsg(null);
        } else {
          // format inattendu ou erreur renvoyée par le backend
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
  }, []);

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

      <Grid container spacing={3}>
        {products.map((p) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {p.photo ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:4000/uploads/${p.photo}`}
                  alt={p.name}
                  sx={{ objectFit: "cover" }}
                />
              ) : (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
                  <Typography variant="subtitle1">Pas d'image</Typography>
                </div>
              )}

              <CardContent>
                <Typography variant="h6">{p.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48 }}>
                  {p.description || "Pas de description disponible."}
                </Typography>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
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

      {/* debugging utile si toujours rien */}
      {!loading && (
        <details style={{ marginTop: 16 }}>
          <summary>Voir réponse brute (console aussi)</summary>
          <pre>{JSON.stringify(products, null, 2)}</pre>
        </details>
      )}

      <Typography variant="h6" sx={{ mt: 4 }}>
        Total panier: ${totalAmount}
      </Typography>
    </Layout>
  );
};

export default Produits;
