var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var url = require('url');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const Product = require('../models/products.js');
const Brand = require('../models/brands.js');
const User = require('../models/users.js');

const sampleToken = require('../data/uids');
let accessTokenList = [sampleToken];

const contentHeader = { "Content-Type": "application/json" }
const myRouter = Router();
myRouter.use(bodyParser.json());
const PORT = 3001;

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
})

server.listen(PORT, () => {
  User.load();
  Product.load();
  Brand.load();
});

myRouter.get('/api/sunglasses', (request, response) => {
  const query = queryString.parse(url.parse(request.url).query);
  const search = query.search;
  const inStock = query.inStock;

  let results = Product.getAll();

  if (inStock && !['true', 'false'].includes(inStock)) {
    response.writeHead(400, 'The inStock query must be either "true" or "false."');
    return response.end();
  } else if (inStock === 'true') {
    results = results.filter((product) => product.inStock)
  } else if (inStock === 'false') {
    results = results.filter((product) => !product.inStock)
  }

  if (search) {
    results = results.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) || product.description.toLowerCase().includes(search.toLowerCase()));
    response.writeHead(200, contentHeader);
    return response.end(JSON.stringify(results));
  } else if (search === '') {
    response.writeHead(400, 'No empty search string allowed.');
    return response.end();
  }

  response.writeHead(200, contentHeader);
  return response.end(JSON.stringify(results));
});

myRouter.get('/api/sunglasses/:glassId', (request, response) => {
  const productId = request.params.glassId;

  const pair = Product.get(productId);

  if (!pair) {
    response.writeHead(404, 'No product was found with that id, or the id was invalid.');
    response.end();
  }

  response.writeHead(200, contentHeader);
  return response.end(JSON.stringify(pair));
});

myRouter.get('/api/brands', (request, response) => {

  return response.end();
});

myRouter.get('/api/brands/:brandId/sunglasses', (request, response) => {
  return response.end();
});

myRouter.post('/api/login', (request, response) => {
  return response.end();
});

myRouter.get('/api/me/cart', (request, response) => {
  return response.end();
});

myRouter.post('/api/me/cart/:glassId/add', (request, response) => {
  return response.end();
});

myRouter.delete('/api/me/cart/:glassId/remove', (request, response) => {
  return response.end();
});

myRouter.post('/api/me/cart/:glassId/update', (request, response) => {
  return response.end();
});

module.exports = server;