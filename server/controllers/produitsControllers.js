const Product = require("../models/produits");
const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://postgres:1234@localhost:5432/mydb",
});
client.connect();

const productController = {
  async createProduct(req, res) {
    try {
      const { name, price, id_categorie, id_user } = req.body;
      const photo = req.file ? req.file.filename : null;
      if (!name || !price) {
        return res
          .status(400)
          .json({ success: false, message: "Nom et  prix requis" });
      }

      // Vérifier si catégorie existe
      // const cat = await client.query(
      //   'SELECT * FROM categories WHERE name=$1',
      //   [id_categorie]
      // );
      // if (cat.rows.length === 0) {
      //   return res.status(404).json({ success: false, message: `Catégorie '${id_categorie}' introuvable` });
      // }

      // Vérifier si produit existe déjà
      // const existing = await Product.findByName(name);
      // if (existing) {
      //   return res
      //     .status(409)
      //     .json({ success: false, message: "Produit déjà existant" });
      // }

      const product = await Product.create(
        name,
        parseFloat(price),
        id_categorie,
        photo,
        id_user
      );
      res
        .status(201)
        .json({ success: true, message: "Produit créé", data: product });
    } catch (err) {
      console.error("❌ Erreur création produit:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getAllProducts(req, res) {
    try {
      const products = await Product.findAll();
      res.status(200).json(products);
    } catch (err) {
      console.error("❌ Erreur getAllProducts:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Produit introuvable" });
      res.status(200).json(product);
    } catch (err) {
      console.error("❌ Erreur getProductById:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, price, id_categorie } = req.body;
      const photo = req.file ? req.file.filename : undefined;

      const existing = await Product.findById(id);
      if (!existing)
        return res
          .status(404)
          .json({ success: false, message: "Produit introuvable" });

      let category = existing.id_categorie;
      if (id_categorie) {
        const cat = await client.query(
          "SELECT * FROM categories WHERE name=$1",
          [id_categorie]
        );
        if (cat.rows.length === 0)
          return res
            .status(404)
            .json({
              success: false,
              message: `Catégorie '${id_categorie}' introuvable`,
            });
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
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Product.delete(id);
      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Produit introuvable" });
      res.status(200).json(deleted);
    } catch (err) {
      console.error("❌ Erreur deleteProduct:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = productController;
