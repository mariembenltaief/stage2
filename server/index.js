const express = require('express');
const app = express();
const multer = require('multer');
const cors = require('cors'); // <- on importe cors
const path = require('path');
const port = 4000;
const pg = require('pg');
const categoriesController = require("./controllers/categoriesController");
const productController = require("./controllers/produitsControllers");
const { Client } = pg;

const connectionString = 'postgresql://postgres:1234@localhost:5432/mydb';

app.use(express.json()); 

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
// Dossier statique pour accéder aux images uploadées
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // dossier uploads
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
const client = new Client({
  connectionString,
});

client.connect()
  .then(() => console.log("Connexion réussie"))
  .catch(err => console.error("Erreur de connexion", err));

// Créer un utilisateur avec photo
app.post('/users', upload.single('photo'), async (req, res) => {
  const { name, email, password } = req.body;
  const photo = req.file ? `/${req.file.filename}` : null; 

  console.log("Body reçu:", req.body);
  console.log("Fichier reçu:", req.file);

  try {
    const result = await client.query(
      'INSERT INTO users (name, email, "password", photo) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, password, photo]
    );

    res.status(200).json({ message: "Utilisateur créé", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})
// Route Login 
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND "password" = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

   
    res.status(200).json({ message: "Connexion réussie", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



// Route GET pour tous les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Route PUT pour mettre à jour un utilisateur par ID
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const result = await client.query(
      'UPDATE users SET name = $1, email = $2, "password" = $3 WHERE id = $4 RETURNING *',
      [name, email, password, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Utilisateur mis à jour", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post('/brands', upload.single('logo'), async (req, res) => {
  const { name } = req.body;
  const logo = req.file ? `${req.file.filename}` : null;

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
app.post('/produit', upload.single('photo'), productController.createProduct);
app.put('/produit/:id', upload.single('photo'), productController.updateProduct);
app.get('/produit', productController.getAllProducts);
app.get('/produit/:id', productController.getProductById);

app.delete('/produit/:id', productController.deleteProduct);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

