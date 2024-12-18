const express = require('express');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Replace './swagger.yaml' with the path to your Swagger file
const app = express();
require('dotenv').config();

app.use(express.json());

// Importing the data from JSON files
const users = require('../initial-data/users.json');
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');

// Error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Authenticate token when login is required
const authenticate = (req, res, next) => {
  try {
    const token = req.headers['authorization']; // Get token from Authorization header
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // Access info from token using decoded
    const user = users.find((u) => u.login.username === decoded.username) // Locate user info
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user

    next();
  }
  catch (error) { // Use built in error names for errors with token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(401).json({ message: 'Authentication failed'})
  }
}

// Route to get brands
app.get('/brands', (req, res) => {
  res.status(200).json(brands);
});

// Route to get products by selected brand
app.get('/products', (req, res) => {
  const brandId = parseInt(req.query.brandId) // Get brandId from query

  if(!brandId) {
    return res.status(400).json({ message: 'Brand ID is required'})
  }

  const brandProducts = products.filter(product => product.categoryId === brandId) // Set brandId to the categoryId for each product listed

  if (brandProducts.length === 0) {
    return res.status(404).json({ message: 'No products for this brand found'})
  }

  res.status(200).json(brandProducts)
})


// Route to authenticate users and generate JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body; //pull username and password from request
	const user = users.find(u => u.login.username === username); //searching for user with username which match request

  if (!user || user.login.password !== password) { // if password or username don't match or don't exist, give error 401
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate a JWT token with user data
  const token = jwt.sign(
    { username: user.login.username },
    process.env.JWT_SECRET,  // Using a secret key from environment variables
    { expiresIn: '1h' }
  );

  res.set('authorization', token);
  
  return res.status(200).json({ token: token }); // Response to be returned
});


// Route to authenticate token and get cart
app.get('/cart', authenticate, (req, res) => {
  const user = req.user
  res.status(200).json(user.cart);  // Send the cart items in the response
})

// Route to add an item to user's cart
app.post('/cart', authenticate, (req, res) => {
  const user = req.user
  const { newItem } = req.body

  try {
    if (!user.cart) {
      user.cart = [];
    }

    const existingItem = user.cart.find((item) => item.id === newItem.id);

    if (existingItem) {
      existingItem.quantity += newItem.quantity
    }

    else {
      user.cart.push({
        id: newItem.id,
        quantity: newItem.quantity,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price
      });
    } 

    res.status(200).json({ message: 'Item added to cart', cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
})

app.delete('/cart:itemId', authenticate, (req, res) => {
  const user = req.user
  const { itemId } = req.params;
  const itemIndex = user.cart.findIndex((item) => item.id === parseInt(itemId))

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found in cart'})
  }

  user.cart.splice(itemIndex, 1)
  res.status(200).json({message: 'Item removed from cart', cart: user.cart})
})


// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = app;
