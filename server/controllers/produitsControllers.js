// server/controllers/produitsControllers.js
const { Client } = require("pg");
const Product = require("../models/produits"); // ton modèle produit

// Connexion à PostgreSQL
const client = new Client({
  connectionString: "postgresql://postgres:1234@localhost:5432/mydb",
});
client.connect()
  .then(() => console.log("✅ Connexion réussie à PostgreSQL"))
  .catch(err => console.error("❌ Erreur connexion PostgreSQL:", err));

// --- FONCTIONS ASYNC ---
const createProduct = async (req, res) => {
  try {
    const { name, price, id_categorie, id_user } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: "Nom et prix requis" });
    }

    const product = await Product.create(name, parseFloat(price), id_categorie, photo, id_user);
    res.status(201).json({ success: true, message: "Produit créé", data: product });
  } catch (err) {
    console.error("❌ Erreur création produit:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = `
      SELECT 
        p.id_produit AS id,
        p.name AS name,
        p.price AS price,
        p.photo AS photo,
        p.id_user AS id_user,
        c.name AS category_name,
        c.description AS category_description
      FROM products p
      LEFT JOIN categories c ON p.id_categorie = c.id_categorie
    `;
    const params = [];

    if (userId) {
      query += " WHERE p.id_user = $1";
      params.push(userId);
    }

    const result = await client.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Erreur getAllProducts:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Produit introuvable" });
    res.status(200).json(product);
  } catch (err) {
    console.error("❌ Erreur getProductById:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, id_categorie } = req.body;
    const photo = req.file ? req.file.filename : undefined;

    const existing = await Product.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Produit introuvable" });

    let category = existing.id_categorie;
    if (id_categorie) {
      const cat = await client.query("SELECT * FROM categories WHERE id_categorie=$1", [id_categorie]);
      if (cat.rows.length === 0) {
        return res.status(404).json({ success: false, message: `Catégorie '${id_categorie}' introuvable` });
      }
      category = id_categorie;
    }

    const updated = await Product.update(
      id,
      name || existing.name,
      price !== undefined ? parseFloat(price) : existing.price,
      category,
      photo
    );
    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Erreur updateProduct:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.delete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Produit introuvable" });
    res.status(200).json(deleted);
  } catch (err) {
    console.error("❌ Erreur deleteProduct:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- EXPORT ---
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
