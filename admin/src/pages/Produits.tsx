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

interface Product {
  id?: number;
  name: string;
  price: number;
  category_name: string;
  photo?: string | null;
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

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    price: 0,
    category_name: "",
    photo: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Récupérer produits et catégories
  useEffect(() => {
    fetch("http://localhost:4000/produit")
      .then(res => res.json())
      .then(data => setProducts(data.data || data))
      .catch(err => console.error("Erreur récupération produits:", err));

    fetch("http://localhost:4000/categories")
      .then(res => res.json())
      .then(data => setCategories(data.map((cat: any) => cat.name)))
      .catch(err => console.error("Erreur récupération catégories:", err));
  }, []);

  const handleClose = () => {
    setOpen(false);
    setPhotoFile(null);
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setNewProduct({ name: "", price: 0, category_name: "", photo: null });
    setOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setNewProduct(product);
    setOpen(true);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price.toString());
    formData.append("category_name", newProduct.category_name);
    if (photoFile) formData.append("photo", photoFile);

    const url = isEditing && currentProduct 
      ? `http://localhost:4000/produit/${currentProduct.id}` 
      : "http://localhost:4000/produit";

    const method = isEditing ? "PUT" : "POST";

    fetch(url, { method, body: formData })
      .then(res => res.json())
      .then(data => {
        if (isEditing && currentProduct) {
          setProducts(products.map(p => p.id === currentProduct.id ? data.data : p));
        } else {
          setProducts([...products, data.data]);
        }
        handleClose();
      })
      .catch(err => console.error("Erreur sauvegarde produit:", err));
  };

  const handleDelete = (id?: number) => {
    if (!id) return;
    fetch(`http://localhost:4000/produit/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => {
        setProducts(products.filter(p => p.id !== id));
      })
      .catch(err => console.error("Erreur suppression produit:", err));
  };

  return (
    <div style={{ width: "100%", height: "100%", marginTop: -250 }}>
      <div style={{ marginRight: -450 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddShoppingCartIcon />}
          style={{ marginRight: -900 }}
          onClick={handleOpenAdd} 
        >
          Ajouter Produit
        </Button>
      </div>
      <Sidebar />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Nom</StyledTableCell>
              <StyledTableCell>Prix</StyledTableCell>
              <StyledTableCell>Catégorie</StyledTableCell>
              <StyledTableCell>Photo</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <StyledTableRow key={product.id}>
                <StyledTableCell>{product.name}</StyledTableCell>
                <StyledTableCell>{product.price}</StyledTableCell>
                <StyledTableCell>{product.category_name}</StyledTableCell>
                <StyledTableCell>
                  {product.photo && (
                <img
              src={`http://localhost:4000/uploads/${product.photo}`}
              alt={product.name}
              width={50}/>
            )}
                </StyledTableCell>
                <StyledTableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenEdit(product)}
                    style={{ marginRight: 8 }}
                  >
                    ✏️ Modifier
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(product.id)}
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
            {isEditing ? "Modifier le produit" : "Ajouter un produit"}
          </Typography>
          <TextField
            fullWidth
            label="Nom"
            margin="normal"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Prix"
            margin="normal"
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
          />
          <TextField
            select
            fullWidth
            label="Catégorie"
            margin="normal"
            value={newProduct.category_name}
            onChange={(e) => setNewProduct({ ...newProduct, category_name: e.target.value })}
            SelectProps={{ native: true } as any}
          >
            <option value="">Sélectionner</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </TextField>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
            style={{ marginTop: 10 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>Annuler</Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              {isEditing ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ProductsPage;
