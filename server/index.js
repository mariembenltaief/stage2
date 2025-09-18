const express = require('express');
const app = express();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const productController = require('./controllers/produitsControllers');
const categoriesController = require('./controllers/categoriesController');
const { Client } = require('pg'); // importer PostgreSQL

const client = new Client({
  connectionString: 'postgresql://postgres:1234@localhost:5432/mydb' // à adapter
});

client.connect()
  .then(() => console.log("✅ Connexion à PostgreSQL réussie"))
  .catch(err => console.error("❌ Erreur connexion:", err));


app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Créer un utilisateur
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

// Récupérer tous les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT id, name, email, photo FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SQL:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des utilisateurs" });
  }
});


console.log("🚀 ~ password1:")
app.get("/get",async (req,res) => { 
  return res.json("hhhh")
 })
app.post('/Login', async (req, res) => {
  const { email, password } = req.body;
  console.log("🚀 ~ email:", email)
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

// Routes catégories
app.post("/categories", categoriesController.createCategory);
app.get("/categories", categoriesController.getAllCategories);
app.get("/categories/:name", categoriesController.getCategoryByName);
app.put("/categories/:name", categoriesController.updateCategory);
app.delete("/categories/:name", categoriesController.deleteCategory);

// Routes produits
app.post('/produit', upload.single('photo'), productController.createProduct);
app.get('/produit', productController.getAllProducts);
app.get('/produit/:id', productController.getProductById);
app.put('/produit/:id', upload.single('photo'), productController.updateProduct);
app.delete('/produit/:id', productController.deleteProduct);

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
