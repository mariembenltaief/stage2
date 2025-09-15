const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://postgres:1234@localhost:5432/mydb"
});

client.connect()
  .then(() => console.log("✅ Connexion réussie à PostgreSQL"))
  .catch(err => console.error("❌ Erreur connexion Categories:", err));

const Category = {
  // Créer une catégorie
  async create(name, description) {
    const result = await client.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  },

  // Récupérer toutes les catégories
  async findAll() {
    const result = await client.query("SELECT * FROM categories ORDER BY name ASC");
    return result.rows;
  },

  // Récupérer une catégorie par name
  async findByName(name) {
    const result = await client.query("SELECT * FROM categories WHERE name = $1", [name]);
    return result.rows[0];
  },

  // Mettre à jour une catégorie par name
  async update(oldName, name, description) {
    const result = await client.query(
      "UPDATE categories SET name = $1, description = $2 WHERE name = $3 RETURNING *",
      [name, description, oldName]
    );
    return result.rows[0];
  },
// Supprimer une catégorie par name
async delete(name) {
  const result = await client.query(
    "DELETE FROM categories WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) RETURNING *",
    [name]
  );
  return result.rows[0]; 
}

};

module.exports = Category;
