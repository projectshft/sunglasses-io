const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi.yaml');
const app = express();
const fs = require('fs');
const { generateToken, checkToken } = require('./token');
const { checkCart, addCartItem, updateCartItem, deleteCartItem } = require('./cart');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Handle x-www-form-urlencoded in request body

/* Helper functions to read and write user data */
const usersFilePath = process.env.NODE_ENV === 'test' ? './test/testUsers.json' : './data/users.json';

function readUsers() {
  return JSON.parse(fs.readFileSync(usersFilePath,"utf-8"));
};

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

// Importing the data from JSON files
const users = readUsers();
let activeUser = {};
const brands = require('../data/brands.json');
const products = require('../data/products.json');
let accessTokens = [];
			
/**Error handling */
app.use((err, req, res, next) => {
	console.error(err.stack);
	return res.status(500).send('Something went wrong');
});
				
/**OpenAPI Documentation */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**GET brands */
app.get('/v1/brands', (req, res) => {
	return res.send(brands);
});

/**GET brandId */
app.get('/v1/brands/:brandId/products', (req, res) => {
	const { brandId } = req.params;
	// Are there any matching brand IDs?
	const matchingProducts = products.filter(product => product.categoryId === brandId);
	if (matchingProducts.length === 0) {
		return res.status(404).send('Failed to locate product with the specified ID');
	}
	// Successful request
	 return res.send(matchingProducts);
});

/**GET products */
app.get('/v1/products', (req, res) => {
	return res.send(products);
});

/**POST user/login */
app.post('/v1/user/login', (req, res) => {
	// Pull username and password from the request
	const { username, password } = req.body;
	
	// Is there a matching user?
	const matchingUser = users.find(user => user.login.username === username);
	if (!matchingUser) {
		return res.status(401).send("Invalid username or password supplied")
	}
	
	// Is the password correct for this specific user?
	const matchingPassword = matchingUser.login.password === password ? true : false;
	if (!matchingPassword) {
		return res.status(401).send("Invalid username or password supplied")
	}

	// Is there already an access token for this user? 
	let currentAccessToken = accessTokens.find(token => token.username === username);
	if (currentAccessToken) { // If access token, update the timestamp.
		currentAccessToken.lastUpdated = new Date();
	} else { // If no access token, generate a new one.
		currentAccessToken = generateToken(username);
		accessTokens.push(currentAccessToken);
	}
	
	// Login successful
	activeUser = matchingUser;
	return res.send(currentAccessToken);
});

/**POST user/logout */
app.post('/v1/user/logout', (req, res) => {
	// Is the user not logged in?
	if (Object.keys(activeUser).length === 0) {
		return res.status(500).send("Something went wrong");
	}

	// Successful logout
	// Find the token of the active user
	const matchingToken = accessTokens.find(token => token.username === activeUser.login.username);
	// Filter the matching token from the list
	accessTokens = accessTokens.filter(token => token !== matchingToken);
	// Reset active user
	activeUser = {};
	return res.status(204).send("Successful logout");
});

/**GET cart */
app.get('/v1/me/cart', (req, res) => {
	// Did the request include a token?
	const requestToken = req.headers.authorization;
	if (!requestToken) {
		return res.status(401).send('Authentication required: Missing token');
	}
	
	// Is the token valid?
	const matchingToken = checkToken(accessTokens, requestToken);
	if (!matchingToken) {
		return res.status(401).send('Authentication required: Invalid token');
	}
	
	// Find the user associated with the token
	activeUser = users.find(user => user.login.username === matchingToken.username);
	if (!activeUser) {
		return res.status(404).send('User not found');
	}
	
	// Successful request
	return res.send(activeUser.cart);
});

/**POST cart */
app.post('/v1/me/cart', (req, res) => {
	
	// Did the request include a token?
	const requestToken = req.headers.authorization;
	if (!requestToken) {
		return res.status(401).send('Authentication required: Missing token');
	}
	
	// Is the token valid?
	const matchingToken = checkToken(accessTokens, requestToken);
	if (!matchingToken) {
		return res.status(401).send('Authentication required: Invalid token');
	}
	
	// Find the user associated with the token
	activeUser = users.find(user => user.login.username === matchingToken.username);
	if (!activeUser) {
		return res.status(404).send('User not found');
	}

	const { productId, quantity } = req.body;
	// Did the request include a product?
	if (!productId) {
		return res.status(400).send('Please include a product to add to the cart.');
	}

	// Check for product in list of products
	const matchingProduct = products.find(product => product.id === productId);
	if (!matchingProduct) {
		return res.status(404).send('Failed to locate product with the specified ID');
	}

	// Check for product already in cart
	const matchingCartItem = checkCart(activeUser.cart, productId)
	if (matchingCartItem) {
		return res.status(403).send('Unable to add a product that already exists in the cart');
	}

	// Add item to cart
	activeUser.cart = addCartItem(activeUser.cart, matchingProduct, quantity);
	writeUsers(users);
	return res.status(201).send('Successfully added product to cart');
});

/**PUT cart item */
app.put('/v1/me/cart/:productId', (req, res) => {
	
	// Did the request include a token?
	const requestToken = req.headers.authorization;
	if (!requestToken) {
		return res.status(401).send('Authentication required: Missing token');
	}

	// Is the token valid?
	const matchingToken = checkToken(accessTokens, requestToken);
	if (!matchingToken) {
		return res.status(401).send('Authentication required: Invalid token');
	}

	// Find the user associated with the token
	activeUser = users.find(user => user.login.username === matchingToken.username);
	if (!activeUser) {
		return res.status(404).send('User not found');
	}

	// Did the request query parameters include a productId?
	const productId = req.params.productId;
	if (!productId) {
		return res.status(400).send('Missing required query parameter');
	}
	
	// Did the request body include a quantity?
	const quantity = req.body.quantity;
	if (!quantity) {
		return res.status(400).send('Missing quantity from request');
	}			
	
	if (Number(quantity) === 0 || quantity > 1000) {
		return res.status(403).send('Unable to update the quantity to that value');
	}			

	// Check for item in cart
	const matchingCartItem = checkCart(activeUser.cart, productId);
	if (!matchingCartItem) {
		return res.status(404).send('Failed to locate product with the specified ID');
	}
	
	// Update item in cart
	activeUser.cart = updateCartItem(activeUser.cart, productId, quantity);
	writeUsers(users);
	return res.status(200).send('Successfully updated cart item');
});

/**DELETE cart item */
app.delete('/v1/me/cart/:productId', (req, res) => {
	
	// Did the request include a token?
	const requestToken = req.headers.authorization;
	if (!requestToken) {
		return res.status(401).send('Authentication required: Missing token');
	}

	// Is the token valid?
	const matchingToken = checkToken(accessTokens, requestToken);
	if (!matchingToken) {
		return res.status(401).send('Authentication required: Invalid token');
	}

	// Did the request query parameters include a productId?
	const productId = req.params.productId;
	if (!productId) {
		return res.status(400).send('Missing required query parameter');
	}

	// Check for item in cart
	const matchingCartItem = checkCart(activeUser.cart, productId);
	if (!matchingCartItem) {
		return res.status(404).send('Failed to locate product with the specified ID');
	}

	// Remove item from cart
	activeUser.cart = deleteCartItem(activeUser.cart, productId);
	writeUsers(users);
	return res.status(200).send('Successfully deleted cart item');
});

/**Catch-all route for undefined routes */
app.use((req, res, next) => {
	return res.status(404).send({ error: 'Route not found. Check /api-docs for available routes.' });
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = app;
