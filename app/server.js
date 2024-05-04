const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('js-yaml');
const swaggerDocument = YAML.load('./swagger.yaml');
const app = express();

app.use(bodyParser.json());

// Define routes for brands/products/user authentication/user's cart
app.get('/api/brands', getBrands);
app.get('/api/products', getProducts);
app.post('/api/login', login);
app.get('/api/cart', getUserCart);
app.post('/api/cart', addToCart);

// Importing the data from JSON files
const users = require('./initial-data/users.json');
const brands = require('./initial-data/brands.json');
const products = require('./initial-data/products.json');

// GET /api/brands
app.get("/api/brands", (req, res) => {
	res.status(200).json(brands);
  });
  
  // POST /api/login
app.post("/api/me/cart", (req, res) => {
	const { userId } = req;
	const user = users.find((user) => user.id == userId);
  
	if (!user) {
	  return res.status(404).json({ message: "User not found" });
	}
  
	const { productId } = req.body;
	const product = products.find((product) => {
	  return product.id == productId;
	});
  
	if (!product) {
	  return res.status(404).json({ message: "Product not found" });
	}
  
	user.cart.push(product);
	return res.status(200).json({ message: "Product added to cart" });
  });
  

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;