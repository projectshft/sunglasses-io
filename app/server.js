const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Replace './swagger.yaml' with the path to your Swagger file
const app = express();
require('dotenv').config();

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

//Middleware

const authenticateJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if(!authHeader) {
		return res.sendStatus(401);
	}

	if(authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
			if(err) {
				return res.sendStatus(403);
			}

			req.user = user;
			next();
		});
	}
};

// Starting the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});


app.get('/brands', (req, res) => {
	return res.json(brands);
});

app.get('/brands/:id/products', (req, res) => {

	if(!brands.some(brand => brand.id === req.params.id)) {
		return res.status(404).send("Brand not found")
	}
	const brandProducts = products.filter((product) => product.categoryId == req.params.id)
	res.json(brandProducts)
})

app.get('/products', (req, res) => {
	return res.json(products)
})


app.post('/login', (req, res) => {

	if(!req.body.username || !req.body.password) {
		return res.status(400).send("Username and password are required")
	}

	let user = users.find((user) => user.login.username === req.body.username)

	if(!user) {
		return res.status(401).send("User not found")
	}

	if(user.login.password !== req.body.password) {
		return res.status(401).send("Invalid password")
	}

	if(user.login.password === req.body.password) {
		const token	= jwt.sign(user, process.env.JWT_SECRET)
		res.json({ accessToken: token })
	}
	
});


app.get('/me/cart', authenticateJWT, (req, res) => {
	let user = users.find((user) => user.login.username === req.user.login.username)
	res.json(user.cart);
});

app.post('/me/cart', authenticateJWT, (req, res) => {
	if(req.body == {}) {
		return res.status(400).send("Product is required")
	}
	if(!req.body.productId || !req.body.name || !req.body.price || !req.body.quantity) {
		return res.status(400).send("Product is invalid")
	}
	let user = users.find((user) => user.login.username === req.user.login.username)
	user.cart.push(req.body)
	res.status(201).json	(user.cart);
});


app.delete('/me/cart/:productId', authenticateJWT, (req, res) => {
	let userIndex = users.findIndex((user) => user.login.username === req.user.login.username);
    
	if (userIndex === -1) {
			return res.status(404).send("User not found");
	}

	let user = users[userIndex];
	user.cart = user.cart.filter((product) => product.id != req.params.productId);

	// Update the user in the users array
	users[userIndex] = user;
	res.json(user.cart);
});

app.post('/me/cart/:productId', authenticateJWT, (req, res) => {
	let userIndex = users.findIndex((user) => user.login.username === req.user.login.username);
		
	if (userIndex === -1) {
			return res.status(404).send("User not found");
	}

	let user = users[userIndex];


	let cartProductIndex = user.cart.findIndex((product) => product.id == req.params.productId);


	// update the quantity of the product
	if (cartProductIndex === -1) {
		return res.status(404).send("Product not found");
} else {
		user.cart[cartProductIndex].quantity = req.body.quantity;
}

	// Update the user in the users array
	users[userIndex] = user;

	res.json(user.cart);
});

module.exports = app;
