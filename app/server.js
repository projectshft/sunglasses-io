const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Replace './swagger.yaml' with the path to your Swagger file
const cors = require('cors');

const app = express();

const PRIVATE_KEY = "ILoveSunglasses";

app.use(cors({
	origin: 'http://localhost:3000',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Authorization', 'Content-Type'],
	credentials: true
}));

app.use(bodyParser.json());

// Importing the data from JSON files
const users = require('../initial-data/users.json');
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');

const verifyToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: 'No token provided' });
	}
	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, PRIVATE_KEY);
		req.username = decoded.username;

		const payload = jwt.decode(token, { complete: true }).payload;
		const currentExp = payload.exp;

		if (currentExp) {
			const updatedExp = Math.floor(Date.now() / 1000) + 3600;
			payload.exp = updatedExp;

			const updatedToken = jwt.sign(payload, PRIVATE_KEY);
			res.locals.newToken = updatedToken;
		}

		next();
	} catch (error) {
		res.status(401).json({ error: 'Token invalid or expired' });
	}
};

// Error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

app.get('/brands', (req, res) => {
	res.status(200).json(brands);
});

app.get('/products', (req, res) => {
	res.status(200).json(products);
});

app.post('/login', (req, res) => {
	const { username, password } = req.body;
	const user = users.find(user => user.login.username === username && user.login.password === password);
	if (!user) {
		return res.status(401).json({ error: 'Invalid login info' });
	}
	const token = jwt.sign({ username: username }, PRIVATE_KEY, { expiresIn: '1h' });
	res.locals.newToken = token;
	res.status(200).json({
		cart: user.cart,
		token: res.locals.newToken
	});
});

app.get('/brands/:id/products', (req, res) => {
	const brandId = req.params.id;
	const targetBrand = brands.filter(brand => brand.id === brandId);
	if (targetBrand.length === 0) {
		return res.status(404).json({ error: 'Invalid brand ID' });
	}
	const brandName = targetBrand[0].name;
	const brandProducts = products.filter(product => product.categoryId === brandId)
	if (brandProducts.length === 0) {
		return res.status(422).json({ error: `No products found for ${brandName}` });
	}

	res.status(200).json(brandProducts);

});

app.get('/me/cart', verifyToken, (req, res) => {
	const currentUser = users.find(user => user.login.username === req.username);
	if (!currentUser) {
		return res.status(404).json({ error: 'User not found' });
	}
	res.status(200).json({
		cart: currentUser.cart,
		token: res.locals.newToken
	});
});

app.post('/me/cart', verifyToken, (req, res) => {
	const { productId, quantity } = req.body;
	if (!productId || !quantity) {
		return res.status(400).json({ error: 'Missing productId or quantity' });
	}
	const currentUser = users.find(user => user.login.username === req.username);
	currentUser.cart.push({ productId, quantity });
	res.status(200).json({
		cart: currentUser.cart,
		token: res.locals.newToken
	});
});

app.delete('/me/cart/:productId', verifyToken, (req, res) => {
	const user = users.find(user => user.login.username === req.username);
	const productId = req.params.productId;
	user.cart = user.cart.filter(item => item.productId != productId);
	res.status(200).json({
		cart: user.cart,
		token: res.locals.newToken
	});
});

app.put('/me/cart/:productId', verifyToken, (req, res) => {
	const user = users.find(user => user.login.username === req.username);
	const productId = req.params.productId;
	const { quantity } = req.body;
	if (!quantity || typeof quantity !== 'number') {
		return res.status(400).json({ error: 'Must use valid quantity' });
	}
	const item = user.cart.find(item => item.productId ===productId);
	if (item) {
		item.quantity = quantity;
		res.status(200).json({
			cart: user.cart,
			token: res.locals.newToken
		});
	} else {
		res.status(404).json({ error: 'Item not found in cart' });
	}
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Starting the server
if (require.main === module) {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
});
}

module.exports = app;