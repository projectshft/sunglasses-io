const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const url = require('url');
const Router = require('router');
const bodyParser = require('body-parser');
const { uid } = require('rand-token');

const PORT = 3001;

// Import data
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');
const users = require('../initial-data/users.json');

// Set up router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Set up server
const server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT);

// Set up /api/brands endpoint handler
myRouter.get('/api/brands', (request, response) => {
  // Return all brands
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// Set up /api/brands/{brandId}/products endpoint handler
myRouter.get('/api/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;

  // If brand ID parameter is invalid, return 400 error
  if (!parseInt(brandId) || parseInt(brandId) <= 0) {
    response.writeHead(400);
    return response.end('Bad request. ID must be an integer and larger than 0');
  }

  // If brand ID does not exist, return 404 error
  if (!brands.find((brand) => brand.id === brandId)) {
    response.writeHead(404);
    return response.end('A brand with the specified ID was not found');
  }

  // Otherwise, return all products for a given brand
  const brandProducts = products.reduce((acc, product) => {
    if (product.categoryId === brandId) {
      acc.push(product);
    }
    return acc;
  }, []);
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brandProducts));
});

// Set up /api/products endpoint handler
myRouter.get('/api/products', (request, response) => {
  const queryParams = queryString.parse(url.parse(request.url).query);

  // If search term provided, return only products that match
  if (queryParams.query) {
    const matchingProducts = products.filter(
      (product) =>
        product.name.includes(queryParams.query) ||
        product.description.includes(queryParams.query)
    );
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(matchingProducts));
  }

  // If no search term, return all products
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

// Set up /api/login endpoint handler
// Set up /api/me/cart endpoint handler
// Set up /api/me/cart/{productId} endpoint handler

module.exports = server;
