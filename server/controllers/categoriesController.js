const Category = require("../models/categories");

// Créer une catégorie
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.create(name, description);
    res.status(201).json({ message: "Catégorie créée", category });
  } catch (err) {
    console.error("Erreur création catégorie:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Récupérer toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (err) {
    console.error("Erreur récupération catégories:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Récupérer une catégorie par name
exports.getCategoryByName = async (req, res) => {
  try {
    const category = await Category.findByName(req.params.name);
    if (!category) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    res.status(200).json(category);
  } catch (err) {
    console.error("Erreur récupération catégorie:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Mettre à jour une catégorie par name
exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.update(req.params.name, name, description);
    if (!category) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    res.status(200).json({ message: "Catégorie mise à jour", category });
  } catch (err) {
    console.error("Erreur mise à jour catégorie:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Supprimer une catégorie par name
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.delete(req.params.name);
    if (!category) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    res.status(200).json({ message: "Catégorie supprimée", category });
  } catch (err) {
    console.error("Erreur suppression catégorie:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
