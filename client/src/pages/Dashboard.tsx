import React, { useEffect, useState } from "react";
import { Grid, Card, CardMedia } from "@mui/material";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom"; // ← important

interface AdminType {
  id: number;
  photo: string | null;
}

const Dashboard: React.FC = () => {
  const [admins, setAdmins] = useState<AdminType[]>([]);
  const navigate = useNavigate(); // ← hook pour naviguer

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch("http://localhost:4000/admins");
        const data = await res.json();
        setAdmins(data);
      } catch (err) {
        console.error("Erreur :", err);
      }
    };
    fetchAdmins();
  }, []);

  const getPhotoUrl = (photo: string | null) =>
    photo ? `http://localhost:4000/uploads/${photo}` : "/no-image.png";

  return (
    <Layout>
      <Grid container spacing={3}>
        {admins.map((admin) => (
          <Card
            key={admin.id}
            sx={{
              p: 1,
              width: 200,
              margin: 1,
              textAlign: "center",
              display: "inline-block",
              transition: "0.3s",
              "&:hover": { transform: "scale(1.05)", boxShadow: 5 },
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={getPhotoUrl(admin.photo)}
              alt="Admin"
              sx={{ objectFit: "contain", cursor: "pointer" }} // ← curseur main
              onClick={() => navigate("/produits")} // ← navigation
              onError={(e: any) => (e.target.src = "/no-image.png")}
            />
          </Card>
        ))}
      </Grid>
    </Layout>
  );
};

export default Dashboard;
