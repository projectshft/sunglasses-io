const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const querystring = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const url = require('url');
const { uid } = require('rand-token');

const PORT = process.env.PORT || 3001;

// set varaibles to be accessed inside functions
let brands = [];
let products = [];
let users = [];
let cart = [];

const router = Router();
router.use(bodyParser.json());

// Create server
const server = http.createServer((req, res) => {
  router(req, res, finalHandler(req, res));
});

// server listening
server.listen(3001, (err) => {
  if (err) throw err;
  console.log(`Server running on http://localhost:${PORT}`);

  brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
  cart = JSON.parse(fs.readFileSync('initial-data/cart.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));
});

router.get('api/', (request, response) => {
  response.end('Hello World!');
});

// get all the brands
router.get('/api/brands', (request, response) => {
  let brandsToReturn = [];
  brandsToReturn = brands;
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brandsToReturn));
});

// gets the products with the same brand id
// example will get all oakley products
router.get('/api/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;

  const productsForBrand = products.filter((pro) => pro.brandId === brandId);

  return response.end(JSON.stringify(productsForBrand));
});

// gets all the products
router.get('/api/products', (request, response) => {
  let productsToReturn = [];
  productsToReturn = products;
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(productsToReturn));
});

// logins the user in after checking if they are in database
router.post('/api/login', (request, response) => {
  const { username, password } = request.body;

  if (!username || !password) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    return response.end(`send valid username and password`);
  }
  const isUserExist = users.find(
    (us) => us.login.password == password && us.login.username == username
  );
  if (isUserExist) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(`user ${username} logged in successfully`);
  }

  response.writeHead(400);
  return response.end('invalid username and password');
});

// gets the current cart
router.get('/api/me/cart', (request, response) => {
  cart = JSON.parse(fs.readFileSync('initial-data/cart.json', 'utf-8'));

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cart));
});

// adds a product to the cart with product id
router.post('/api/me/cart/:productId', (request, response) => {
  const { productId } = request.params;

  const quantity = 0;
  const getProduct = products.find((i) => i.id == productId);

  getProduct.quantity = quantity + 1;

  const currentCart = JSON.parse(
    fs.readFileSync('initial-data/cart.json', 'utf-8')
  );

  if (getProduct) {
    console.log(currentCart);
    currentCart.push(getProduct);
    const json = JSON.stringify(currentCart);
    fs.writeFile('initial-data/cart.json', json, 'utf8', () => {});

    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end('added');
  }
  response.writeHead(400);
  return response.end('product not found');
});

// deletes an item from the cart
router.delete('/api/me/cart/:productId', (request, response) => {
  const { productId } = request.params;

  let currentCart = JSON.parse(
    fs.readFileSync('initial-data/cart.json', 'utf-8')
  );
  const getProduct = currentCart.find((pro) => pro.id == productId);
  const filterCart = currentCart.filter((data) => data.id !== productId);

  if (getProduct) {
    currentCart = filterCart;
    const json = JSON.stringify(currentCart);

    fs.writeFile('initial-data/cart.json', json, 'utf8', () => {});

    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end('product removed');
  }
  response.writeHead(400);
  return response.end('product not found');
});

module.exports = server;

// GET /api/brands

// GET /api/brands/:id/products

// GET /api/products

// POST /api/login

// GET /api/me/cart

// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId
