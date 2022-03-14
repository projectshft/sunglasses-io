// const queryString = require('querystring');

const http = require('http');
const Router = require('router');
const bodyParser = require('body-parser');
const finalHandler = require('finalhandler');
const fs = require('fs');

const { loginHelper } = require('./login');

// const Product = require('./models/productModel');

const PORT = 3001;
const myRouter = Router();

myRouter.use(bodyParser.json());

let products;
let listOfProductIds;
let brands;
const cart = [];

const server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
    listOfProductIds = products.map((product) => product.id);
    brands = JSON.parse(fs.readFileSync('./data/brands.json', 'utf-8'));
  });

myRouter.get('/products', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

myRouter.get('/brands', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

myRouter.get('/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(
    JSON.stringify(products.filter((product) => product.brandId === brandId))
  );
});

myRouter.post('/api/login', loginHelper);

myRouter.get('/me/cart', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cart));
});

myRouter.post('/me/cart', (request, response) => {
  const { productId } = request.body;

  if (!productId) {
    response.writeHead(400);
    return response.end();
  }
  if (!listOfProductIds.includes(productId)) {
    response.writeHead(404);
    return response.end('Product not found');
  }

  const productToAdd = products.find((product) => product.id === productId);
  cart.push(productToAdd);

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cart));
});

myRouter.post('/me/cart/:productId', (request, response) => {
  const { productId } = request.params;

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cart));
});

module.exports = server;
