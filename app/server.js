var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

// State-holding variables
let brands = [];
let products = [];
let users = [];

const PORT = 3111;

// Router setup
const myRouter = Router();
myRouter.use(bodyParser.json());

// Server setup
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`Server running on port ${PORT}`);

  // Populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
  console.log(`Brands: ${brands.length} loaded`)

  // Populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
  console.log(`Products: ${products.length} loaded`)

  // Populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  console.log(`Users: ${users.length} loaded`)
});

// GET all products
myRouter.get("/api/products", (request, response) => {
  if (products.length === 0) {
    response.writeHead(404, "No products were found");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

// GET all brands
myRouter.get("/api/brands", (request, response) => {
  if (brands.length === 0) {
    response.writeHead(404, "No brands were found");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

// GET all products of given brand
myRouter.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const productsOfBrand = products.filter(product => product.categoryId === id)

  if (productsOfBrand.length === 0) {
    response.writeHead(404, "No products were found");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsOfBrand));
});

module.exports = server;