const Product = require('../models/produits');
const Category = require('../models/categories');
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:1234@localhost:5432/mydb"
});

client.connect()
  .then(() => console.log("✅ Connexion réussie à PostgreSQL"))
  .catch(err => console.error("❌ Erreur connexion:", err));

const productController = {
  // Créer un nouveau produit avec upload photo
  async createProduct(req, res) {
    try {
      const { name, price, category_name } = req.body;
      const photo = req.file ? `${req.file.filename}` : null;

      if (!name || !price || !category_name) {
        return res.status(400).json({
          success: false,
          message: 'Le nom, le prix et la catégorie sont requis'
        });
      }

      const category = await Category.findByName(category_name);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `La catégorie '${category_name}' n'existe pas`
        });
      }

      const existingProduct = await Product.findByName(name);
      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: 'Un produit avec ce nom existe déjà'
        });
      }

      const product = await Product.create(
        name,
        parseFloat(price),
        category_name,
        photo
      );

      res.status(201).json({
        success: true,
        message: 'Produit créé avec succès',
        data: product
      });
    } catch (error) {
      console.error('❌ Erreur création produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création du produit'
      });
    }
  },

  // Récupérer tous les produits avec la catégorie
  async getAllProductsWithCategory(req, res) {
    try {
      const result = await client.query(`
        SELECT 
            p.id,
            p.name AS product_name,
            p.price,
            p.photo,
            c.name AS category_name,
            c.description AS category_description
        FROM products p
        JOIN categories c ON p.category_name = c.name
        ORDER BY p.name ASC
      `);
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // Récupérer tous les produits
  async getAllProducts(req, res) {
    try {
      const products = await Product.findAll();
      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('❌ Erreur récupération produits:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des produits'
      });
    }
  },

  // Récupérer un produit par ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé'
        });
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('❌ Erreur récupération produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du produit'
      });
    }
  },

  // Mettre à jour un produit
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, price, category_name } = req.body;
      const photo = req.file ? `${req.file.filename}` : undefined;

      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé'
        });
      }

      if (category_name) {
        const category = await Category.findByName(category_name);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: `La catégorie '${category_name}' n'existe pas`
          });
        }
      }

      const updatedProduct = await Product.update(
        id,
        name || existingProduct.name,
        price !== undefined ? parseFloat(price) : existingProduct.price,
        category_name || existingProduct.category_name,
        photo // si undefined, garde l’ancienne
      );

      res.status(200).json({
        success: true,
        message: 'Produit mis à jour avec succès',
        data: updatedProduct
      });
    } catch (error) {
      console.error('❌ Erreur mise à jour produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour du produit'
      });
    }
  },

  // Supprimer un produit
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const deletedProduct = await Product.delete(id);

      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Produit supprimé avec succès',
        data: deletedProduct
      });
    } catch (error) {
      console.error('❌ Erreur suppression produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression du produit'
      });
    }
  }
};

module.exports = productController;
