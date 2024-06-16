const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi.yaml');
const app = express();
const fs = require('fs');
const uid = require('rand-token').uid;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Handle x-www-form-urlencoded in request body

if (process.env.NODE_ENV === 'test') {
  console.log('Running in test mode');
}

const usersFilePath = process.env.NODE_ENV === 'test' ? './test/testUsers.json' : './data/users.json';
const tokensFilePath = process.env.NODE_ENV === 'test' ? './test/testTokens.json' : '';

/* Helper functions to read and write user data */
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

/**Authentication */
const accessTokens = [];
// An access token can look like this:
// {
	//   username: 'bob',
	//   lastUpdated: <A valid date>,
	//   token: 'qwertyuiopasdfg1'
	// }
function generateToken(username) {
	const newToken = { username: username, lastUpdated: new Date(), token: uid(16) };
	accessTokens.push(newToken);
	if (process.env.NODE_ENV === 'test') {
		writeTokens(accessTokens);
		}
	return newToken;
}
/* Helper functions to read and write tokens for testing */
function readTokens() {
	return JSON.parse(fs.readFileSync(tokensFilePath,"utf-8"));
};

function writeTokens(tokens) {
	fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2), 'utf-8');
}
			
			// Error handling
			app.use((err, req, res, next) => {
				console.error(err.stack);
				res.status(500).send('Something broke!');
				});
				
				// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**Get Root */
app.get('/', (req, res) => {
	res.send('Hello world');
});

/**GET brands */
app.get('/v1/brands', (req, res) => {
	res.send(brands);
});

/**GET brandId */
app.get('/v1/brands/:brandId/products', (req, res) => {
	const { brandId } = req.params;
	const matchingProducts = products.filter(product => product.categoryId === brandId);
	if (matchingProducts.length > 0) {
		//successful match
		res.send(matchingProducts);
	} else {
		//failed to get a match
		res.status(404).send();
	}
});

/**GET products */
app.get('/v1/products', (req, res) => {
	res.send(products);
});

/**POST user/login */
app.post('/v1/user/login', (req, res) => {
	// Make sure there is a username and password in the request
	const { username, password } = req.body;
	const matchingUser = users.filter(user => user.login.username === username);
	// Is there a matching user?
	if (matchingUser.length === 1) {
		// Is the password correct for this specific user?
		if (matchingUser[0].login.password === password) {
			// Is there already an access token for this user? 
			let currentAccessToken = accessTokens.find(token => token.username === username);
			if (currentAccessToken) { // If access token, update the timestamp.
				currentAccessToken.lastUpdated = new Date();
			} else { // If no access token, generate a new one.
				currentAccessToken = generateToken(username);
			}
			res.send(currentAccessToken);
		} else {
			res.status(401).send("Invalid username or password supplied")
		}
	} else {
		res.status(401).send("Invalid username or password supplied")
	}

	// Add functionality for access token
	// If they already have an access token, use that.
	// Update the last updated value of the existing token so we get another time period before expiration
	// Create a new token with the user value and a "random" token
	// If they are missing one of the parameters, tell the client "something was wrong with the formatting of the request"


});

/**POST user/logout */
app.post('/v1/user/logout', (req, res) => {
	//error
	// if user not logged in
	// How is user login state handled?
	// res.status(500).send();

	//success
	res.status(204).send();
});

/**GET cart */
app.get('/v1/me/cart', (req, res) => {
	res.send(); // user.cart
});

/**POST cart */
app.post('/v1/me/cart', (req, res) => {
	//success
	res.status(201).send(); // user.cart
	//failed
});

/**PUT cart item */
app.put('/v1/me/cart/:productId', (req, res) => {
	//success
	res.status(200).send(); // user.cart
	//failed
});

/**DELETE cart item */
app.delete('/v1/me/cart/:productId', (req, res) => {
	//success
	res.status(200).send(); // user.cart
	//failed
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = app;
