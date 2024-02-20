const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger-updated.yaml');
const app = express();
const uid = require('rand-token').uid;
const newAccessToken = uid(16);

app.use(bodyParser.json());

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

// Define get /api/brands endpoint
app.get('/api/brands', (req, res) => {
  const brandsData = [];
  res.status(200).json(brandsData);
});

// Define get /api/brands/:brandId/products endpoint
app.get('/api/brands/:brandId/products', (req, res) => {
  const brandId = req.params.brandId;
  const productsData = []; 
  res.status(200).json(productsData);
});

// Define get /api/products endpoint
app.get('/api/products', (req, res) => {
  const productsData = [];
  res.status(200).json(productsData);
});

// Define post /api/login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(user => user.login.username === username && user.login.password === password);

  if (user) {
    res.status(200).json({ message: 'Login succesful'});
  } else {
    res.status(401).json({ error: 'Invalid credentials'});
  }
});



// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});



module.exports = app;


