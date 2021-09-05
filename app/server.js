var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const url = require("url");

//State holding variables
let products = [];
let brands = [];
let users = [];

const PORT = 3001;

//Set up router
const router = Router();
router.use(bodyParser.json());

//Server
http.createServer(function (request, response) {
  response.writeHead(200);
  router(request, response, finalHandler(request, response));
})

.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
  //populate brands
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
});

//GET all products or products filtered by a query
router.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const {query} = queryString.parse(parsedUrl.query);
  let productsToReturn = [];

  if (query === undefined) {
    productsToReturn = products;
  } else {
    productsToReturn = products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
  }

  if (!productsToReturn) {
    response.writeHead(404, "No products match query");
    return response.end();
  }

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(productsToReturn));
});

//GET all brands
router.get("/api/brands", (request, response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
});

//GET all products for a specific brand
router.get("/api/brands/:id/products", (request, response) => {
  const {id} = request.params;
  const brand = brands.find(brand => brand.id == id);

  const relatedProducts = products.filter(product => product.categoryId == brand.id);

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(relatedProducts));
});