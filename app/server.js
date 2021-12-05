var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
const url = require("url");
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const PORT = 3001;

let brands = [];
let products = [];
let users = [];
var accessTokens = [];

var router = Router();
router.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  router(request, response, finalHandler(request, response))
}).listen(PORT, ()=> {
  // load initial data from files
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
});

// GET all brands
router.get('/api/brands', (request, response) => {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(brands));
});

// GET products of a given brand
router.get('/api/brands/:id/products', (request, response) => {
  const brandId = request.params.id;
  const brand = brands.find(brand => brand.id === brandId);
  
  if (!brand) {
    response.writeHead(404, "That brand was not found");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  const productsOfGivenBrand = products.filter(product => product.categoryId === brandId);
  return response.end(JSON.stringify(productsOfGivenBrand));
});

// GET products matching a given search query
router.get('/api/products', (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let productsWithQuery = [];

  if (query) {
    productsWithQuery = products.filter(product => product.description.includes(query))
  }

  if (productsWithQuery.length === 0) {
    response.writeHead(404, "There are no products matching that query");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsWithQuery));
});

// POST user login
router.post('/api/login', (request, response) => {
  // Confirm request includes a username and password
  if (!request.body.username || !request.body.password) {

    response.writeHead(400, "Incorrectly formatted request");
    return response.end();
  }

  // Identify user with the given credentials
  let user = users.find(user => user.login.username === request.body.username && user.login.password === request.body.password);

  // Respond if credentials are invalid
  if (!user) {
    response.writeHead(401, "Invalid username and/or password");
    return response.end();
  }
  
  response.writeHead(200, { "Content-Type": "application/json" });

  // Check if user already has an access token
  let currentAccessToken = accessTokens.find(tokenInfo => tokenInfo.username === user.login.username);
  
  // If user has token already, modify date it was last updated and return it
  if (currentAccessToken) {
    currentAccessToken.lastUpdated = new Date();
    return response.end(JSON.stringify(currentAccessToken.token));
  } else {
    // If user doesn't have a token, create a new one and return it
    let newAccessToken = {
      username: user.login.username,
      lastUpdated: new Date(),
      token: uid(16)
    }
    accessTokens.push(newAccessToken);
    return response.end(JSON.stringify(newAccessToken.token));
  }
});

module.exports = server;