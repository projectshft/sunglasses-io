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
let accessTokens = [];

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

// // POST user credentials
myRouter.post("/api/login", (request, response) => {
  // Missing parameters, return early
  if (!request.body.username || !request.body.password) {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
  
  // Find valid user/password
  const user = users.find((user) => (
    user.login.username === request.body.username &&
    user.login.password === request.body.password
  ));

  // No matching user/password found, return early
  if (!user) {
    response.writeHead(401, "Invalid username or password");
    return response.end();
  }
  
  // Success
  response.writeHead(200, { "Content-Type": "application/json" });

  // Check if user already has access token
  const currentAccessToken = accessTokens.find((tokenObject) => (
    tokenObject.username === user.login.username
  ));

  // Access token exists already, update and return early
  if (currentAccessToken) {
    currentAccessToken.lastUpdated = new Date();
    return response.end(JSON.stringify(currentAccessToken.token));
  }

  // Create new access token
  const newAccessToken = {
    username: user.login.username,
    lastUpdated: new Date(),
    token: uid(16),
  };
  
  // Access token does not exist, use new token and return
  accessTokens.push(newAccessToken);
  console.log(accessTokens);
  return response.end(JSON.stringify(newAccessToken.token))
});

module.exports = server;