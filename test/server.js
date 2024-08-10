const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const app = express();
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// Load data
const users = require(path.join(__dirname, '../initial-data/users.json'));
const products = require(path.join(__dirname, '../initial-data/products.json'));
const brands = require(path.join(__dirname, '../initial-data/brands.json'));
let carts = {}; // In-memory storage for carts (userId -> cart)
let JWT_SECRET = crypto.randomBytes(32).toString('hex'); // Initially generate JWT secret key

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Generate new JWT secret
const generateJWTSecret = () => {
  JWT_SECRET = crypto.randomBytes(32).toString('hex');
  return JWT_SECRET;
};

// Login endpoint
app.post('/users', (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  console.log(users);
  const user = users.find(u => u.email === email && u.login.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  generateJWTSecret(); // Generate new JWT secret upon login

  const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ accessToken });
});

// Middleware to check JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Get user's cart
app.get('/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const cart = carts[userId] || [];
  res.json({ items: cart });
});

// Add product to cart
app.post('/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!products.find(p => p.id === productId)) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (!carts[userId]) {
    carts[userId] = [];
  }

  const existingItem = carts[userId].find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts[userId].push({ productId, quantity });
  }

  res.json({ items: carts[userId] });
});

// Get products by brand
app.get('/products/:brand', (req, res) => {
  const brandName = req.params.brand.toLowerCase();
  const brand = brands.find(b => b.name.toLowerCase() === brandName);

  if (!brand) {
    return res.status(404).json({ message: 'Brand not found' });
  }
  console.log(brand);

  const filteredProducts = products.filter(p => p.categoryId === brand.id);
  res.json(filteredProducts);
});

// Search for glasses
app.get('/search', (req, res) => {
  const query = req.query.query;
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  res.json(filteredProducts);
});

// Starting the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server }; 