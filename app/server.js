var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const Brands = require('../initial-data/brands.json');
const Products = require('../initial-data/products.json');

const PORT = 3001;

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

// TODO: GET all brands
myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Brands));
})

// TODO: GET all products given brand id
myRouter.get('/api/brands/:id/products', function(request, response) {
  const { id } = request.params;
  const products = Products.find(product => product.categoryId == id);
  if (!products) {
    response.writeHead(404, "That brand id does not exist");
    return response.end();
  }
  response.writeHead(200, {"Content-Type": "application/json"});
  const relatedProducts = Products.filter(product => product.categoryId == id);
  return response.end(JSON.stringify(relatedProducts));
})

module.exports = server;
