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
let accessTokens = [];
// initialized accessTokens array for testing with user greenlion235
// let accessTokens = [{
//   username: 'greenlion235',
//   accessToken: '1qp0Im9oRzeBXcdF',
//   lastUpdated: new Date,
// }]
const VALID_TOKEN_TIMEOUT = 20 * 60 * 1000; // 20-minute timeout

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

  const productsOfGivenBrand = products.filter(product => product.categoryId === brandId);

  response.writeHead(200, { "Content-Type": "application/json" });
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
    return response.end(JSON.stringify(currentAccessToken.accessToken));
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

const getValidTokenInfoFromRequest = request => {
  const parsedUrl = url.parse(request.originalUrl);
  const { accessToken } = queryString.parse(parsedUrl.query)

  // Return access token only if currently valid
  if (accessToken) {
    let currentTokenInfo = accessTokens.find(tokenInfo => {
      return (tokenInfo.accessToken === accessToken) && ((new Date - tokenInfo.lastUpdated) < VALID_TOKEN_TIMEOUT)
    });
    if (currentTokenInfo) {
      return currentTokenInfo;
    }
  }
  return null;
};

const findUserByUsername = (queryUsername) => {
  return users.find(user => user.login.username === queryUsername)
}

// GET all items from the user's cart
router.get('/api/me/cart', (request, response) => {
  // User must be logged in to access their cart
  let currentTokenInfo = getValidTokenInfoFromRequest(request);
  if (!currentTokenInfo) {
    // If there is no valid access token in the request, the client is not authorized to access any user's cart
    response.writeHead(401, "You do not have access to continue");
    return response.end();
  } else {
    let user = findUserByUsername(currentTokenInfo.username);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

const findUserIndexByUsername = (queryUsername) => {
  return users.findIndex(user => user.login.username === queryUsername)
}

const updateUser = (user, userIndex) => {
  users[userIndex] = user;
  fs.writeFileSync("updated-data/users.json", JSON.stringify(users), "utf-8");
}

// POST add item to the user's cart
router.post('/api/me/cart', (request, response) => {
  // User must be logged in to access their cart
  let currentTokenInfo = getValidTokenInfoFromRequest(request);
  if (!currentTokenInfo) {
    // If there is no valid access token in the request, the client is not authorized to access any user's cart
    response.writeHead(401, "You do not have access to continue");
    return response.end();
  }

  // Confirm request includes a product
  let productId = request.body.product.id;
  if (!productId) {
    response.writeHead(400, "Incorrectly formatted request");
    return response.end();
  }

  // Find product if productId is valid
  let product = products.find(product => product.id === productId);
  if (!product) {
    response.writeHead(404, "That product was not found");
    return response.end();
  }

  // Add product with quantity of 1 to the user's cart
  let user = findUserByUsername(currentTokenInfo.username);
  let newItem = {
    product: product,
    quantity: 1
  }
  user.cart.push(newItem);

  // update users array with newly updated user and write to users.json file in updated-data folder
  let userIndex = findUserIndexByUsername(user.login.username);
  updateUser(user, userIndex);

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(newItem));
});

// DELETE remove item from the user's cart
router.delete('/api/me/cart/:productId', (request, response) => {
  // User must be logged in to access their cart
  let currentTokenInfo = getValidTokenInfoFromRequest(request);
  if (!currentTokenInfo) {
    // If there is no valid access token in the request, the client is not authorized to access any user's cart
    response.writeHead(401, "You do not have access to continue");
    return response.end();
  }
  
  let productId = request.params.productId;

  // Confirm productId is valid
  if (!products.find(product => product.id === productId)) {
    response.writeHead(404, "That product was not found");
    return response.end();
  }

  // Remove product from user's cart
  let user = findUserByUsername(currentTokenInfo.username);
  let cartIndex = user.cart.findIndex(item => item.product.id === productId);
  if (cartIndex !== -1) {
    // remove item from user's cart and update users users.json file
    user.cart.splice(cartIndex, 1);
    let userIndex = findUserIndexByUsername(user.login.username);
    updateUser(user, userIndex);

    response.writeHead(200);
    return response.end();
  } else {
    response.writeHead(404, "That product was not found");
    return response.end();
  }
});

// POST update quantity of items in the user's cart
router.post('/api/me/cart/:productId', (request, response) => {
  // User must be logged in to access their cart
  let currentTokenInfo = getValidTokenInfoFromRequest(request);
  if (!currentTokenInfo) {
    // If there is no valid access token in the request, the client is not authorized to access any user's cart
    response.writeHead(401, "You do not have access to continue");
    return response.end();
  }
  
  // Verify newQuantity is included in the request
  const parsedUrl = url.parse(request.originalUrl);
  const { newQuantity } = queryString.parse(parsedUrl.query);
  if (!newQuantity) {
    response.writeHead(400, "Incorrectly formatted request");
    return response.end();
  }

  let productId = request.params.productId;

  // Confirm productId is valid
  if (!products.find(product => product.id === productId)) {
    response.writeHead(404, "That product was not found");
    return response.end();
  }

  // Update quantity of product in user's cart
  let user = findUserByUsername(currentTokenInfo.username);
  let cartIndex = user.cart.findIndex(item => item.product.id === productId);
  if (cartIndex !== -1) {
    // update quantity of item in user's cart and update users.json file
    user.cart[cartIndex].quantity = newQuantity;
    let userIndex = findUserIndexByUsername(user.login.username);
    updateUser(user, userIndex);

    response.writeHead(200);
    return response.end();
  } else {
    response.writeHead(404, "That product was not found");
    return response.end();
  }
});

module.exports = server;