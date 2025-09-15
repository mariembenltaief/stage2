import React, { ReactNode } from "react";
import { AppBar, Toolbar, IconButton, Typography, Badge, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";

interface LayoutProps {
  children: ReactNode;
}

const footerHeight = 64; // Hauteur du footer

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <MailIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <Badge badgeContent={17} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Contenu central */}
      <Box sx={{ flexGrow: 1, paddingTop: "80px", paddingBottom: `${footerHeight}px`, px: 3 }}>
        {children}
      </Box>

      
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
