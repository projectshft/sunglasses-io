const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;

// State
let brands = [];
let products = [];
let users = [];
let accessTokens = [];
const PORT = 3001;

fs.readFile('initial-data/brands.json', 'utf-8', (err, data) => {
  if (err) throw err;
  brands = JSON.parse(data);
});

fs.readFile('initial-data/products.json', 'utf-8', (err, data) => {
  if (err) throw err;
  products = JSON.parse(data);
});

fs.readFile('initial-data/users.json', 'utf-8', (err, data) => {
  if (err) throw err;
  users = JSON.parse(data);
  currentUser = users[0];
});

// Setup router
const router = Router();
router.use(bodyParser.json());

// Setup server
const server = http
  .createServer((req, res) => {
    res.writeHead(200);
    router(req, res, finalHandler(req, res));
  })
  .listen(PORT);

// Brands routes
router.get('/api/brands', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(brands));
});

router.get('/api/brands/:id/products', (req, res) => {
  let brandId = req.params.id;
  let brandProducts = products.filter(product => {
    return product.brandId === brandId;
  });

  if (brandProducts.length === 0) {
    res.writeHead(401, 'No products with that brand found');
    res.end();
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(brandProducts));
});

// Products routes
router.get('/api/products', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(products));
});

// Users's cart routes
router.get('/api/me/cart', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(currentUser.cart));
});

module.exports = server;
