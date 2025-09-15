const express = require('express');
const app = express();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { Client } = require('pg');

const categoriesController = require("./controllers/categoriesController");
const productController = require("./controllers/produitsControllers");

const port = 4000;
const connectionString = 'postgresql://postgres:1234@localhost:5432/mydb';

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Connexion PostgreSQL
const client = new Client({ connectionString });
client.connect()
  .then(() => console.log("✅ Connexion réussie à PostgreSQL"))
  .catch(err => console.error("❌ Erreur de connexion:", err));


app.post('/users', upload.single('photo'), async (req, res) => {
  const { name, email, password } = req.body;
  const photo = req.file ? req.file.filename : null;

  try {
    const result = await client.query(
      'INSERT INTO users (name, email, "password", photo) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, password, photo]
    );
    res.status(200).json({ message: "Utilisateur créé", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: "Email déjà utilisé" });
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND "password" = $2',
      [email, password]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    res.status(200).json({ message: "Connexion réussie", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.post('/brands', upload.single('logo'), async (req, res) => {
  const { name } = req.body;
  const logo = req.file ? req.file.filename : null;

  try {
    const result = await client.query(
      'INSERT INTO brands (name, logo) VALUES ($1, $2) RETURNING *',
      [name, logo]
    );
    res.status(200).json({ message: "Marque créée", brand: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/brands', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM brands');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.post("/categories", categoriesController.createCategory);
app.get("/categories", categoriesController.getAllCategories);
app.get("/categories/:name", categoriesController.getCategoryByName);
app.put("/categories/:name", categoriesController.updateCategory);
app.delete("/categories/:name", categoriesController.deleteCategory);


app.post('/produit', upload.single('photo'), async (req, res) => {
  try {
    const { name, price, category_name, brand_id } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !price || !category_name || !brand_id) {
      return res.status(400).json({ success: false, message: "Le nom, le prix, la catégorie et la marque sont requis" });
    }

    // Vérifier si catégorie existe
    const categoryResult = await client.query('SELECT * FROM categories WHERE name = $1', [category_name]);
    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `La catégorie '${category_name}' n'existe pas` });
    }

    // Vérifier si marque existe
    const brandResult = await client.query('SELECT * FROM brands WHERE id = $1', [brand_id]);
    if (brandResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `La marque avec ID '${brand_id}' n'existe pas` });
    }

    // Créer le produit
    const result = await client.query(
      'INSERT INTO products (name, price, category_name, brand_id, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, parseFloat(price), category_name, parseInt(brand_id), photo]
    );

    res.status(201).json({ success: true, message: "Produit créé avec succès", product: result.rows[0] });

  } catch (err) {
    console.error("❌ Erreur création produit:", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la création du produit" });
  }
});

app.put('/produit/:id', upload.single('photo'), productController.updateProduct);
app.get('/produit', productController.getAllProducts);
app.get('/produit/:id', productController.getProductById);
app.get('/produit-with-category', productController.getAllProductsWithCategory);
app.delete('/produit/:id', productController.deleteProduct);


app.get('/brands-with-products', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        b.id AS brand_id,
        b.name AS brand_name,
        b.logo AS brand_logo,
        c.name AS category_name,
        c.description AS category_description,
        p.id AS product_id,
        p.name AS product_name,
        p.price AS product_price,
        p.photo AS product_photo
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_name = c.name
      ORDER BY b.name, c.name, p.name
    `);

    const brandsMap = {};

    result.rows.forEach(row => {
      if (!brandsMap[row.brand_id]) {
        brandsMap[row.brand_id] = {
          id: row.brand_id,
          name: row.brand_name,
          logo: row.brand_logo,
          categories: {}
        };
      }

      if (row.category_name && row.product_id) {
        if (!brandsMap[row.brand_id].categories[row.category_name]) {
          brandsMap[row.brand_id].categories[row.category_name] = {
            name: row.category_name,
            description: row.category_description,
            products: []
          };
        }

        brandsMap[row.brand_id].categories[row.category_name].products.push({
          id: row.product_id,
          name: row.product_name,
          price: row.product_price,
          photo: row.product_photo
        });
      }
    });

    const brands = Object.values(brandsMap).map(brand => ({
      ...brand,
      categories: Object.values(brand.categories).filter(cat => cat.products.length > 0)
    }));

    res.json(brands);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
