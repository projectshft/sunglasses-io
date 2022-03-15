// const queryString = require('querystring');

const http = require('http');
const Router = require('router');
const bodyParser = require('body-parser');
const finalHandler = require('finalhandler');
const fs = require('fs');

const Cart = require('./models/cartModel');
const { successHandler } = require('./helperFuncs');
const { loginHelper } = require('./loginHelper');

const PORT = 3001;
const myRouter = Router();

myRouter.use(bodyParser.json());

let products;
let listOfProductIds;
let brands;
let listOfbrandIds;

const server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
    listOfProductIds = products.map((product) => product.id);
    brands = JSON.parse(fs.readFileSync('./data/brands.json', 'utf-8'));
    listOfbrandIds = brands.map((brand) => brand.id);
  });

// get products
myRouter.get('/products', (request, response) => {
  successHandler(response);
  return response.end(JSON.stringify(products));
});

// get brands
myRouter.get('/brands', (request, response) => {
  successHandler(response);
  return response.end(JSON.stringify(brands));
});

// get products from a specific brand
myRouter.get('/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;

  if (!listOfbrandIds.includes(brandId)) {
    response.writeHead(404);
    return response.end('Product not found');
  }

  successHandler(response);
  return response.end(
    JSON.stringify(products.filter((product) => product.brandId === brandId))
  );
});

// login handler
myRouter.post('/login', loginHelper);

// get current shopping cart
myRouter.get('/me/cart', (request, response) => {
  successHandler(response);
  return response.end(JSON.stringify(Cart.getCart()));
});

// add product to cart
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

  Cart.addToCart(productId);

  successHandler(response);
  return response.end(JSON.stringify(Cart.getCart()));
});

// delete product from cart
myRouter.delete('/me/cart', (request, response) => {
  const { productId } = request.body;

  if (!productId) {
    response.writeHead(400);
    return response.end();
  }
  if (!listOfProductIds.includes(productId)) {
    response.writeHead(404);
    return response.end('Product not found');
  }

  Cart.removeFromCart(productId);

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(Cart.getCart()));
});

module.exports = server;
