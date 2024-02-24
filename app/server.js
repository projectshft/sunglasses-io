const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Replace './swagger.yaml' with the path to your Swagger file
const app = express();

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
	
	const sha256 = users.find((user) => user.login.username === req.body.username).login.sha256

	if(authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, sha256, (err, user) => {
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
		const token	= jwt.sign(user, user.login.sha256)
		res.json({ accessToken: token })
	}
	
});


app.get('/me/cart', authenticateJWT, (req, res) => {
	let user = users.find((user) => user.login.username === req.body.username)
	res.json(user.cart);
});

app.post('/me/cart', authenticateJWT, (req, res) => {
	let user = users.find((user) => user.login.username === req.body.username)
	user.cart.push(req.body)
	res.json(user.cart);
});

module.exports = app;
