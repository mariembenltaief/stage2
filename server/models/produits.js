const { Client } = require("pg");
const Category = require("./categories");

const client = new Client({
  connectionString: "postgresql://postgres:1234@localhost:5432/mydb"
});

client.connect()
  .then(() => console.log("✅ Connexion réussie à PostgreSQL"))
  .catch(err => console.error("❌ Erreur connexion Products:", err));

const Product = {
  // Créer un produit
  async create(name, price, category_name, photo = null) {
    const category = await Category.findByName(category_name);
    if (!category) throw new Error(`La catégorie '${category_name}' n'existe pas`);

    const result = await client.query(
      'INSERT INTO products (name, price, category_name, photo) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, category_name, photo]
    );
    return result.rows[0];
  },

  // Récupérer tous les produits
  async findAll() {
    const result = await client.query("SELECT * FROM products ORDER BY name ASC");
    return result.rows;
  },

  // Récupérer un produit par ID
  async findById(id) {
    const result = await client.query("SELECT * FROM products WHERE id = $1", [id]);
    return result.rows[0];
  },

  // Récupérer un produit par nom
  async findByName(name) {
    const result = await client.query("SELECT * FROM products WHERE name = $1", [name]);
    return result.rows[0];
  },

  // Mettre à jour un produit
  async update(id, name, price, category_name, photo) {
    const existing = await Product.findById(id);
    if (!existing) throw new Error(`Produit ID ${id} introuvable`);

    if (category_name) {
      const category = await Category.findByName(category_name);
      if (!category) throw new Error(`La catégorie '${category_name}' n'existe pas`);
    }

    const result = await client.query(
      "UPDATE products SET name=$1, price=$2, category_name=$3, photo=$4 WHERE id=$5 RETURNING *",
      [
        name || existing.name,
        price !== undefined ? price : existing.price,
        category_name || existing.category_name,
        photo !== undefined ? photo : existing.photo,
        id
      ]
    );
    return result.rows[0];
  },

  // Supprimer un produit
  async delete(id) {
    const result = await client.query("DELETE FROM products WHERE id=$1 RETURNING *", [id]);
    return result.rows[0];
  }
};

module.exports = Product;
