const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Replace './swagger.yaml' with the path to your Swagger file
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());

// Importing the data from JSON files
const users = require('../initial-data/users.json');
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');

app.get('/api/products', (req, res) => {
	res.status(200).json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.status(200).json(product);
});

app.get('/api/users', (req, res) => {
	res.status(200).json(users);
});

app.get('/api/users/:username', (req, res) => {
  const user = users.find(u => u.login.username === req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
});

app.get('/api/users/:username/cart', (req, res) => {
  const user = users.find(u => u.login.username === req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
});

// add item to a users cart
app.post('/api/users/:username/cart', (req, res) => {
  const user = users.find(u => u.login.username === req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { productId, quantity } = req.body;

  // ValiDate the request
  if (!productId || typeof quantity !== 'number' || quantity < 1) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // check if product already exists in the cart
  const existingItem = user.cart.find(item => item.productId === productId);

  if (existingItem) {
    // if exists, update the quantity
    existingItem.quantity += quantity;
  } else {
    // If it doesn't, add it as a new item
    user.cart.push({ productId, quantity });
  }

  res.status(201).json({ message: 'Product added to cart' });
});

// Remove item from the user cart
app.delete('/api/users/:username/cart/product/:productId', (req, res) => {
  const user = users.find(u => u.login.username === req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const index = user.cart.findIndex(item => item.productId === req.params.productId);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not in cart' });
  }

  user.cart.splice(index, 1); 
  res.status(200).json({ message: 'Product removed from cart' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the fields are filled
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Find a user that matches both username and password
  const user = users.find(u => u.login.username === username && u.login.password === password);

  // If no user is found, return an error
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // If match found, return a success message (no token for now)
  res.status(200).json({ message: 'Login successful' });
});

// Error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Starting the server

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = app;
