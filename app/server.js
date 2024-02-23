const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger-updated.yaml');
const app = express();
const fs = require('fs');

app.use(bodyParser.json());

// Access to data
const products = JSON.parse(fs.readFileSync('api/products.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('api/users.json', 'utf-8'));
const brands = JSON.parse(fs.readFileSync('api/brands.json', 'utf-8'));

// Error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Verify token function
function verifyToken(req, res, next) {
  const authorizationHeader = req.header('Authorization');

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authorizationHeader.replace('Bearer ', '');

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.username = decoded.username;
    next();
  });
}

// Define GET /api/brands endpoint
app.get('/api/brands', (req, res) => {
    res.status(200).json(brands);
  });


// Define GET /api/brands/:brandId/products endpoint
app.get('/api/brands/:brandId/products', (req, res) => {
  const brandId = req.params.brandId;

  // Filter products based on brandId
  const productsFromBrandId = products.filter(product => product.brandId === brandId);

  res.status(200).json(productsFromBrandId);
  });


// Define GET /api/products endpoint 
app.get('/api/products', (req, res) => {
    res.status(200).json(products);
  });


// Define POST /api/login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const secretKey = 'secretkey';
  const options = { expiresIn: '1h' };

  // Finds the user
  const user = users.find(user => user.login.username === username && user.login.password === password);

  if (user) {
    // Generate and send a token if login is successful
    const token = jwt.sign({ username: user.login.username }, secretKey, options);
    console.log('Generated Token:', token);
    res.status(200).json({ message: 'Login successful', token: token, user: user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});


// Define GET api/me/cart endpoint
app.get('/api/me/cart', verifyToken, (req, res) => {

  const username = req.username;

  // Find the user based on the username in the users array
  const user = users.find((user) => user.login.username === username);

  if (user) {
    // Return the user/cart data
    res.status(200).json(user.cart);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});


// Define POST /api/me/cart endpoint
app.post('/api/me/cart', verifyToken, (req, res) => {

  const username = req.username;
  
  // Find the user based on the username
  const user = users.find(user => user.login.username === username);
  
  if (user) {
    // Return the current state of the user's cart without modifying it
    res.status(200).json(user.cart);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });


// Define POST /api/me/cart/:productId endpoint
app.post('/api/me/cart/:productId', verifyToken, (req, res) => {

  const username = req.username;

  // Find the user based on the username
  const user = users.find(user => user.login.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const productId = req.params.productId;
  const productToAdd = products.find(product => product.id === productId);

  if (!productToAdd) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Check if the product is already in the user's cart
  const existingCartItem = user.cart.find(item => item.product.id === productId);

  if (existingCartItem) {
    // If the product is already in the cart, increment the quantity
    existingCartItem.quantity++;
  } else {
    // If the product is not in the cart, add it with a quantity of 1
    user.cart.push({
      product: productToAdd,
      quantity: 1,
    });
  }

  // Return the updated cart
  res.status(200).json(user.cart);
});


// Define DELETE /api/me/cart/:productId endpoint
app.delete('/api/me/cart/:productId', verifyToken, (req, res) => {

  const username = req.username;

  // Find the user based on the username
  const user = users.find(user => user.login.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const productId = req.params.productId;

  // Find the product in the user's cart
  const existingCartItem = user.cart.find(item => item.product.id === productId);

  if (existingCartItem) {
    // If the product is in the cart, remove it
    user.cart = user.cart.filter(item => item.product.id !== productId);

    // Return the updated cart
    res.status(200).json(user.cart);
  } else {
    // If the product is not in the cart, respond with an error
    res.status(404).json({ error: 'Product not found in the users cart' });
  }
});

  



// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});



module.exports = app;


