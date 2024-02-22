const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const queryString = require('querystring');
const url = require('url');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger-updated.yaml');
const app = express();
const fs = require('fs');

app.use(bodyParser.json());

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

// Define get /api/brands endpoint
app.get('/api/brands', (req, res) => {
    res.status(200).json(brands);
  });


// Define get /api/brands/:brandId/products endpoint
app.get('/api/brands/:brandId/products', (req, res) => {
  const brandId = req.params.brandId;

  // Filter products based on brandId
  const productsFromBrandId = products.filter(product => product.brandId === brandId);

  res.status(200).json(productsFromBrandId);
  });


// Define get /api/products endpoint 
app.get('/api/products', (req, res) => {
    res.status(200).json(products);
  });


// Define post /api/login endpoint
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


// Define api/me/cart get endpoint
app.get('/api/me/cart', (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', ''); // Extract token from the Authorization header

  // Verify the token to get user information
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const username = decoded.username;

    // Find the user based on the decoded username
    const user = users.find(user => user.login.username === username);

      if (user) {
        // Return the user/cart data
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    });
  });

app.post('/api/me/cart', (req, res) => {
  const authorizationHeader = req.header('Authorization');
  
  if (!authorizationHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  const token = authorizationHeader.replace('Bearer ', '');
  
  // Verify the token to get user information
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  
    const username = decoded.username;
  
    // Find the user based on the decoded username
    const user = users.find(user => user.login.username === username);
  
    if (user) {
      // Return the current state of the user's cart without modifying it
      res.status(200).json(user.cart);
    } 
  });
});

app.post('/api/me/cart/:productId', (req, res) => {
  const authorizationHeader = req.header('Authorization');

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authorizationHeader.replace('Bearer ', '');

  // Verify the token to get user information
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const username = decoded.username;

    // Find the user based on the decoded username
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
});

  




// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});



module.exports = app;


