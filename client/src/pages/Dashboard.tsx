import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import Layout from "../components/Layout";

interface ProductType {
  id: number;
  name: string;
  price: number;
  photo: string | null;
}

interface CategoryType {
  name: string;
  description: string | null;
  products: ProductType[];
}

interface BrandType {
  id: number;
  name: string;
  logo: string | null;
  categories: CategoryType[];
}

const Dashboard: React.FC = () => {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrandsWithProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/brands-with-products");
        if (!res.ok) throw new Error("Erreur réseau");
        const data = await res.json();
        setBrands(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les marques et produits.");
      } finally {
        setLoading(false);
      }
    };
    fetchBrandsWithProducts();
  }, []);

  const getLogoUrl = (logo: string | null) =>
    logo ? `http://localhost:4000/uploads/${logo}` : "/no-image.png";

  const getPhotoUrl = (photo: string | null) =>
    photo ? `http://localhost:4000/uploads/${photo}` : "/no-image.png";

  if (loading)
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="error">{error}</Alert>
        </Box>
      </Layout>
    );

  return (
    <Layout>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        Nos marques
      </Typography>

      <Grid container spacing={3}>
        {brands.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center">Aucune marque disponible</Typography>
          </Grid>
        ) : (
          brands.map((brand) => (
            <Grid key={brand.id} item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                }}
              >
                {/* Logo et nom de la marque */}
                <Box display="flex" alignItems="center" mb={2}>
                  <CardMedia
                    component="img"
                    image={getLogoUrl(brand.logo)}
                    alt={brand.name}
                    sx={{ width: 80, height: 80, objectFit: "contain", mr: 2 }}
                    onError={(e: any) => (e.target.src = "/no-image.png")}
                  />
                  <Typography variant="h5" fontWeight="bold">
                    {brand.name}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Catégories et produits */}
                {brand.categories.length === 0 ? (
                  <Typography>Aucune catégorie disponible</Typography>
                ) : (
                  brand.categories.map((category) => (
                    <Box key={category.name} mb={3}>
                      <Typography variant="h6" fontWeight="bold" mb={1}>
                        {category.name}
                      </Typography>
                      {category.description && (
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {category.description}
                        </Typography>
                      )}
                      {category.products.length === 0 ? (
                        <Typography>Aucun produit disponible</Typography>
                      ) : (
                        category.products.map((product) => (
                          <Card key={product.id} sx={{ mb: 2 }}>
                            <CardMedia
                              component="img"
                              height="150"
                              image={getPhotoUrl(product.photo)}
                              alt={product.name}
                              sx={{ objectFit: "contain", backgroundColor: "#f5f5f5", p: 1 }}
                              onError={(e: any) => (e.target.src = "/no-image.png")}
                            />
                            <CardContent>
                              <Typography variant="h6">{product.name}</Typography>
                              <Typography variant="body1" fontWeight="bold">
                                Prix: {product.price} €
                              </Typography>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </Box>
                  ))
                )}
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Layout>
  );
};

export default Dashboard;