import React, { useEffect, useState } from "react";
import { Grid, Card, CardMedia, CardContent, Typography, Box, CircularProgress, Alert } from "@mui/material";
import Layout from "../components/Layout"; 

interface BrandType {
  id: number;
  name: string;
  logo: string | null;
}

const Dashboard: React.FC = () => {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4000/brands")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then((data) => {
        setBrands(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Impossible de charger les marques. Vérifiez que le serveur est démarré.");
        setLoading(false);
      });
  }, []);

  const getLogoUrl = (logo: string | null) => {
    if (!logo) return "/no-image.png";
    if (logo.startsWith("http")) return logo;
    return `http://localhost:4000/uploads/${logo.replace(/^\/+/, "")}`;
  };

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
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            {error}
          </Alert>
        </Box>
      </Layout>
    );

  return (
    <Layout>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ marginBottom: 3, fontWeight: "bold" }}
      >
        Nos Marques
      </Typography>

      <Grid container spacing={3}>
        {brands.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              Aucune marque disponible
            </Typography>
          </Grid>
        ) : (
          brands.map((brand) => (
            <Grid key={brand.id} item xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  height: 450,
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={getLogoUrl(brand.logo)}
                  alt={brand.name}
                  sx={{ objectFit: "contain", backgroundColor: "#f5f5f5", p: 2 }}
                  onError={(e: any) => (e.target.src = "/no-image.png")}
                />
                <CardContent
                  sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Typography variant="h6" align="center" component="h2">
                    {brand.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Layout>
  );
};

export default Dashboard;
