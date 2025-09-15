import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Box from "@mui/material/Box";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

interface Category {
  name: string;
  description: string;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>({
    name: "",
    description: "",
  });
  

  // états pour modification
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Erreur récupération catégories:", err));
  }, []);

  const handleClose = () => setOpen(false);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setNewCategory({ name: "", description: "" });
    setOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setIsEditing(true);
    setCurrentCategory(cat);
    setNewCategory(cat);
    setOpen(true);
  };

  const handleSave = () => {
    if (isEditing && currentCategory) {
     
      fetch(`http://localhost:4000/categories/${currentCategory.name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })
        .then(() => {
        setCategories(
          categories.map((cat) =>
            cat.name === currentCategory.name ? newCategory : cat
          )
        );
        handleClose();
      })
      .catch((err) => console.error("Erreur modification catégorie:", err));
    } else {
      
      fetch("http://localhost:4000/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })
        .then((res) => res.json())
        .then(() => {
  setCategories([...categories, newCategory]);  
  handleClose();
})

    }
  };

  const handleDelete = (name: string) => {
  fetch(`http://localhost:4000/categories/${name}`, { method: "DELETE" })
    .then((res) => res.json())
    .then(() => {
      setCategories(
        categories.filter(
          cat => cat.name.toLowerCase().trim() !== name.toLowerCase().trim()
        )
      );
    })
    .catch((err) => console.error("Erreur suppression catégorie:", err));
};


  return (
     <div style={{ width: '100%', height: '100%', marginTop: -250 }}>
      <div style={{ marginRight: -450 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddShoppingCartIcon />}
          style={{ marginRight: -900 }}
          onClick={handleOpenAdd}
        >
          Ajouter
        </Button>
      </div>
      <Sidebar />

      {/* Tableau catégories */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Nom</StyledTableCell>
              <StyledTableCell align="right">Description</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell component="th" scope="row">
                  {category.name}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {category.description}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenEdit(category)}
                    style={{ marginRight: 8 }}
                  >
                    ✏️ Modifier
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(category.name)}
                  >
                    🗑️ Supprimer
                  </Button>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>
            {isEditing ? "Modifier la catégorie" : "Ajouter une catégorie"}
          </Typography>
          <TextField
            fullWidth
            label="Nom"
            margin="normal"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>
              Annuler
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              {isEditing ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
