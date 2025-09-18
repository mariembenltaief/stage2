const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://postgres:1234@localhost:5432/mydb",
});

client
  .connect()
  .then(() => console.log("✅ Connexion réussie à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur connexion:", err));

const Product = {
  async create(name, price, id_categorie, photo, id_user) {
    const result = await client.query(
      `INSERT INTO products (name, price, id_categorie, photo, id_user)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, price, id_categorie, photo, id_user]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await client.query(
      `SELECT 
         id_produit AS id,
         name,
         price,
         photo,
         id_categorie,
         id_user
       FROM products`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await client.query(
      `SELECT 
         id_produit AS id,
         name,
         price,
         photo,
         id_categorie,
         id_user
       FROM products
       WHERE id_produit = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findByName(name) {
    const result = await client.query(
      `SELECT 
         id_produit AS id,
         name,
         price,
         photo,
         id_categorie,
         id_user
       FROM products
       WHERE name = $1`,
      [name]
    );
    return result.rows[0];
  },

  async update(id, name, price, id_categorie, photo) {
    const result = await client.query(
      `UPDATE products
       SET name=$1, price=$2, id_categorie=$3, photo=$4
       WHERE id_produit=$5
       RETURNING *`,
      [name, price, id_categorie, photo, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await client.query(
      `DELETE FROM products WHERE id_produit=$1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Product;
