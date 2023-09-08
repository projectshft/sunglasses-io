const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const url = require('url');
const Router = require('router');
const bodyParser = require('body-parser');
const { uid } = require('rand-token');

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 30 * 60 * 1000;
const accessTokens = [
  {
    username: 'yellowleopard753',
    lastUpdated: new Date(),
    token: 'oo5DD2jLOTLR9s5t'
  }
];

// Import data
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');
const users = require('../initial-data/users.json');

// Set up router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Set up server
const server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT);

// Set up /api/brands endpoint handler
myRouter.get('/api/brands', (request, response) => {
  // Return all brands
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// Set up /api/brands/{brandId}/products endpoint handler
myRouter.get('/api/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;

  // If brand ID parameter is invalid, return 400 error
  if (!isPositiveInteger(brandId)) {
    response.writeHead(400);
    return response.end('Bad request. ID must be an integer and larger than 0');
  }

  // If brand ID does not exist, return 404 error
  if (!idExists(brandId, brands)) {
    response.writeHead(404);
    return response.end('A brand with the specified ID was not found');
  }

  // Otherwise, return all products for a given brand
  const brandProducts = products.filter(
    (product) => product.categoryId === brandId
  );

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brandProducts));
});

// Set up /api/products endpoint handler
myRouter.get('/api/products', (request, response) => {
  const queryParams = queryString.parse(url.parse(request.url).query);

  // If search term provided, return only products that match
  if (queryParams.query) {
    const matchingProducts = products.filter(
      (product) =>
        product.name.includes(queryParams.query) ||
        product.description.includes(queryParams.query)
    );
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(matchingProducts));
  }

  // If no search term, return all products
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

// Set up /api/login endpoint handler
myRouter.post('/api/login', (request, response) => {
  // Check whether both username and password are provided in request
  if (request.body.username && request.body.password) {
    // If so, look for user in existing users
    const foundUser = users.find(
      (user) =>
        user.login.username === request.body.username &&
        user.login.password === request.body.password
    );

    // If user exists
    if (foundUser) {
      // Check for existing access token
      const currentAccessToken = accessTokens.find(
        (tokenObject) => tokenObject.username === foundUser.login.username
      );
      // Update the last updated value to extend login
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      }
      // If no existing access token, create a new token with the user value and a "random" token
      const newAccessToken = {
        username: foundUser.login.username,
        lastUpdated: new Date(),
        token: uid(16)
      };
      accessTokens.push(newAccessToken);
      return response.end(JSON.stringify(newAccessToken.token));
    }
    // If username and/or password are incorrect, return 401 error
    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
  // If they are missing one of the parameters, return 400 error
  response.writeHead(
    400,
    'Bad request. Both username and password are required'
  );
  return response.end();
});

// Set up /api/me/cart endpoint handler
// GET - get items in cart
myRouter.get('/api/me/cart', (request, response) => {
  const currentAccessToken = getValidToken(request);

  if (!currentAccessToken) {
    // If user is not logged in, return 401 error
    response.writeHead(401, 'Not authorized');
    return response.end();
  }

  // If user is logged in, get their info
  const currentUser = getCurrentUser(currentAccessToken);

  // Then return their cart
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(currentUser.cart));
});

// POST - add item to cart
myRouter.post('/api/me/cart', (request, response) => {
  const currentAccessToken = getValidToken(request);

  if (!currentAccessToken) {
    // If user is not logged in, return 401 error
    response.writeHead(401, 'Not authorized');
    return response.end();
  }

  // If product ID is not a positive integer, return 400 error
  if (!isPositiveInteger(request.body.id)) {
    response.writeHead(400);
    return response.end('Bad request. ID must be an integer and larger than 0');
  }

  // If product does not exist, return 404 error
  if (!idExists(request.body.id, products)) {
    response.writeHead(404);
    return response.end('A product with the specified ID was not found');
  }

  // Otherwise, if request is valid, add product to cart and return 200
  const currentUser = getCurrentUser(currentAccessToken);
  currentUser.cart.push(getProductById(request.body.id));
  response.writeHead(200);
  return response.end();
});

// Set up /api/me/cart/{productId} endpoint handler
// DELETE - delete item from cart
myRouter.delete('/api/me/cart/:productId', (request, response) => {
  const { productId } = request.params;
  const currentAccessToken = getValidToken(request);

  if (!currentAccessToken) {
    // If user is not logged in, return 401 error
    response.writeHead(401, 'Not authorized');
    return response.end();
  }

  // If product ID is not a positive integer, return 400 error
  if (!isPositiveInteger(productId)) {
    response.writeHead(400);
    return response.end('Bad request. ID must be an integer and larger than 0');
  }

  // If product does not exist, return 404 error
  if (!idExists(productId, products)) {
    response.writeHead(404);
    return response.end('A product with the specified ID was not found');
  }

  // Otherwise, if request is valid, delete product from cart and return 200
  const currentUser = getCurrentUser(currentAccessToken);
  currentUser.cart.filter((item) => item.id !== productId);
  response.writeHead(200);
  return response.end();
});

// PUT - update item quantity in cart
myRouter.put('/api/me/cart/:productId', (request, response) => {
  const { productId } = request.params;
  const currentAccessToken = getValidToken(request);

  if (!currentAccessToken) {
    // If user is not logged in, return 401 error
    response.writeHead(401, 'Not authorized');
    return response.end();
  }

  // If product ID is not a positive integer, return 400 error
  if (!isPositiveInteger(productId)) {
    response.writeHead(400);
    return response.end('Bad request. ID must be an integer and larger than 0');
  }

  // If product does not exist, return 404 error
  if (!idExists(productId, products)) {
    response.writeHead(404);
    return response.end('A product with the specified ID was not found');
  }

  // Otherwise, if request is valid, update product and return 200
  const currentUser = getCurrentUser(currentAccessToken);
  currentUser.cart.filter((item) => item.id !== productId);
  response.writeHead(200);
  return response.end();
});

//
// Helper functions
//

// Check if request parameter is positive integer
const isPositiveInteger = (parameter) =>
  parseInt(parameter) && parseInt(parameter) > 0;

// Check if ID exists in array
const idExists = (id, array) => array.find((item) => item.id === id);

// Process access token
const getValidToken = (request) => {
  const parsedUrl = url.parse(request.url, true);

  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    const currentAccessToken = accessTokens.find(
      (accessToken) =>
        accessToken.token === parsedUrl.query.accessToken &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
    );

    if (currentAccessToken) {
      return currentAccessToken;
    }
    return null;
  }
  return null;
};

// Get the logged in user
const getCurrentUser = (accessToken) =>
  users.find((user) => user.login.username === accessToken.username);

// Get product by ID
const getProductById = (id) => products.find((product) => product.id === id);

module.exports = server;
