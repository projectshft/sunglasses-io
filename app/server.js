var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const url = require("url");

// State holding variables
let products = [];
// let user = {};
let brands = [];
let users = [];

const PORT = 3001;

// Set up router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  //populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  
  // hardcode "logged in" user
  // user = users[0];
});


// endpoint handlers: router.get, router.post

// GET BRANDS
router.get("/api/brands", (request, response) => {
  let brandsToReturn = brands;
  if (brandsToReturn.length === 0) {
    response.writeHead(404, "No brands found");
    return response.end();
  } 
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
});

// GET PRODUCTS BY BRAND 
router.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const brand = brands.find(brand => brand.id === id);
  if (!brand) {
    response.writeHead(404, "Brand does not exist");
    return response.end();
  }
  const productsToReturn = products.filter(
    product => product.brandId === id
  );
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

// GET PRODUCTS
router.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let productsToReturn = []; 
  if (query !== undefined) {
    productsToReturn = products.filter(product => 
      product.name.includes(query) || product.description.includes(query)
    );
    if (productsToReturn.length === 0) {
      response.writeHead(404, "No products found");
      return response.end();
    }
  } else {
    productsToReturn = products; 
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

// LOGIN 
router.post('/api/login', function (request, response) {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(); 
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
}); 

module.exports = server;