const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

const PORT = 3001;

// Import data
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');
const users = require('../initial-data/users.json');

// Set up router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Set up server
let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

// Set up /api/brands endpoint handler
myRouter.get('/api/brands', function(request, response) {
	// Return all brands
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(brands));
});

// Set up /api/brands/{brandId}/products endpoint handler
myRouter.get('/api/brands/:brandId/products', function(request, response) {
  const brandId = request.params.brandId;

  // If brand ID parameter is invalid, return 400 error
  if (!parseInt(brandId) || parseInt(brandId) <= 0) {
    response.writeHead(400);	
		return response.end('Bad request. ID must be an integer and larger than 0');
  }

  // If brand ID does not exist, return 404 error
  if (!brands.find((brand) => brand.id == brandId)) {
    response.writeHead(404);	
		return response.end('A brand with the specified ID was not found');
  }

  // Otherwise, return all products for a given brand
  const brandProducts = products.reduce((acc, product) => {
    if (product.categoryId === brandId) {
      acc.push(product);
    }
    return acc;
  }, [])

  response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(brandProducts));
})

module.exports = server;