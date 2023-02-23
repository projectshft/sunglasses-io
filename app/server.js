const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

// State holding variables
let products = [];
let brands = [];
let product = {};
let user = {};
let cart = [];

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  // Load data from server
  products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));

  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));

  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
});

myRouter.get('/v1/brands', (request, response) => {
  if(!brands) {
    response.writeHead(404, "There are no brands to return");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(brands));
  }
});

myRouter.get('/v1/brands/:id/products', (request, response) => {
  // Find brand by id
  let brand = brands.find((brand) => {
    return brand.id == request.params.id
  })
  // Filter out products that are not from that brand
  let brandProducts = products.filter(p => p.brandId === brand.id);
  if(!brandProducts) {
    response.writeHead(404, "There are no products to return");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(brandProducts));
  }
});
