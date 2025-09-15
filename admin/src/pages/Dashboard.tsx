import React from "react";
import Sidebar from "../components/Sidebar";
import Box from "@mui/material/Box";

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar /> 
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <h2>Bienvenue dans Dashboard</h2>
        
      </Box>
      
    </Box>
  );
};

export default Dashboard;
