const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi.yaml');
const app = express();
const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Handle x-www-form-urlencoded in request body

if (process.env.NODE_ENV === 'test') {
  console.log('Running in test mode');
}

const usersFilePath = process.env.NODE_ENV === 'test' ? './test/testUsers.json' : './data/users.json';

// Helper functions to read and write user data
function readUsers() {
  return JSON.parse(fs.readFileSync(usersFilePath,"utf-8"));
};

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

// Importing the data from JSON files
const users = readUsers();
const brands = require('../data/brands.json');
const products = require('../data/products.json');

// Error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = app;
