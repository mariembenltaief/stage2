import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Produits from "./pages/Produits";

import './App.css';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);


  const handleLoginSuccess = (userData: any) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <>
      <Router>
        {isLoggedIn && <Sidebar user={user} onLogout={handleLogout} />}
        <div className={isLoggedIn ? "content-with-sidebar" : "content-full"}>
          <Routes>
            <Route 
              path="/login" 
              element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                isLoggedIn ? (
                  <div style={{ padding: '20px' }}>
                    <h1>Bienvenue dans votre application</h1>
                    <p>Vous êtes connecté avec l'email: {user?.email}</p>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Categories" element={<Categories />} />
            <Route path="/Produits" element={<Produits />} />
            
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App