var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

// State holding variables

let brands = [];
let products = [];
let user = {};


const PORT = 3001;
const VALID_API_KEYS = ["12345","01234"];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

//Setup server 
const server = http.createServer((request, response) => {
  response.writeHead(200);
  myRouter(request, response, finalHandler(request, response));
});


server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  //populate brands
  brands = JSON.parse(
    fs.readFileSync("initial-data/brands.json", "utf-8"));
  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
  // hardcode "logged in" user
  user = users[0];
});

// List of Brands
myRouter.get('/brands', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

// List of Brands' Products
myRouter.get('/brands/:id/products', (request, response) => {
  const { id } = request.params;
  const brand = brands.find(brand => brand.id == id);

  if (!brand) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(JSON.stringify("That brand does not exist"));
  }
  const relatedProducts = brands.filter(
      products => products.categoryId == brand.id
  );
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(relatedProducts));
});

  module.exports = server;