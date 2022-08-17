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
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

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

// POST user credentials
myRouter.post("/api/login", (request, response) => {
  // Find valid user/password
  const user = users.find((user) => (
    user.login.username === request.body.username &&
    user.login.password === request.body.password
  ));

  // Find access token if it already exists for user
  const currentAccessToken = accessTokens.find((tokenObject) => (
    tokenObject.username === user?.login.username
  ));

  // Create new access token
  const newAccessToken = {
    username: user?.login.username,
    lastUpdated: new Date(),
    token: uid(16),
  };

  // Missing parameters, return 400
  if (!request.body.username || !request.body.password) {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }

  // No matching user/password found, return 401
  if (!user) {
    response.writeHead(401, "Invalid username or password");
    return response.end();
  }
    
  // Access token exists already, update and return
  if (currentAccessToken) {
    currentAccessToken.lastUpdated = new Date();
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(currentAccessToken.token));
  }
  
  // Criteria met, access token does not already exist, use new token and return
  if (newAccessToken) {
    accessTokens.push(newAccessToken);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(newAccessToken.token))
  }
});

// Helper function to check for valid access token
const getValidTokenFromRequest = (request) => {
  const currentAccessToken = accessTokens.find((tokenObject) => {
    return tokenObject.username === request.headers.username  
  });

  const currentAccessTokenLastUpdated = ((new Date) - currentAccessToken?.lastUpdated) 

  const currentAccessTokenIsValid = {
    [!currentAccessTokenLastUpdated]: null,
    [currentAccessTokenLastUpdated >= TOKEN_VALIDITY_TIMEOUT]: null,
    [currentAccessTokenLastUpdated < TOKEN_VALIDITY_TIMEOUT]: currentAccessToken
  };

  return currentAccessTokenIsValid[true] ?? null
}

// GET user cart
myRouter.get("/api/me/cart", (request, response) => {
  const currentAccessToken = getValidTokenFromRequest(request)

  const user = users.find((user) => {
    return user.login.username === currentAccessToken?.username
  })

  if (!currentAccessToken) {
    response.writeHead(401, "Must be logged in to view cart");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

// POST product to user cart
myRouter.get("/api/me/cart", (request, response) => {

});

module.exports = server;