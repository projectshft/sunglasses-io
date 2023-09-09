const http = require('http');
const fs = require('fs');
const path = require('path');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const url = require('url');
const Router = require('router');
const bodyParser = require('body-parser');
const { uid } = require('rand-token');

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 30 * 60 * 1000;
let brands = [];
let products = [];
let users = [];
const accessTokens = [
  {
    username: 'yellowleopard753',
    lastUpdated: new Date(),
    token: 'oo5DD2jLOTLR9s5t'
  },
  {
    username: 'lazywolf342',
    lastUpdated: new Date(),
    token: 'SjlNLkhNnA7DuCJb'
  }
];

// Set up router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Set up server
const server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    if (error) {
      return console.log('Error on Server Startup: ', error);
    }

    // Load data
    fs.readFile(
      path.join(__dirname, '..', 'initial-data', 'brands.json'),
      (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
      }
    );

    fs.readFile(
      path.join(__dirname, '..', 'initial-data', 'products.json'),
      (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
      }
    );

    fs.readFile(
      path.join(__dirname, '..', 'initial-data', 'users.json'),
      (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
      }
    );
  });

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
    return return400Error(response);
  }

  // If brand ID does not exist, return 404 error
  if (!idExists(brandId, brands)) {
    return return404Error(response);
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
        product.name.toLowerCase().includes(queryParams.query.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(queryParams.query.toLowerCase())
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

      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify(newAccessToken.token));
    }
    // If username and/or password are incorrect, return 401 error
    return return401Error(response);
  }
  // If they are missing one of the parameters, return 400 error
  return return400Error(response);
});

// Set up /api/me/cart endpoint handler
// GET - get items in cart
myRouter.get('/api/me/cart', (request, response) => {
  const currentAccessToken = getValidToken(request);

  if (!currentAccessToken) {
    // If user is not logged in, return 401 error
    return return401Error(response);
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
    return return401Error(response);
  }

  // If product ID is not a positive integer, return 400 error
  if (!isPositiveInteger(request.body.id)) {
    return return400Error(response);
  }

  // If product does not exist, return 404 error
  if (!idExists(request.body.id, products)) {
    return return404Error(response);
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
    return return401Error(response);
  }

  // If product ID is not a positive integer, return 400 error
  if (!isPositiveInteger(productId)) {
    return return400Error(response);
  }

  // If product does not exist, return 404 error
  if (!idExists(productId, products)) {
    return return404Error(response);
  }

  // Otherwise, if request is valid, delete product from cart and return 200
  const currentUser = getCurrentUser(currentAccessToken);
  currentUser.cart.filter((item) => item.id !== productId);
  response.writeHead(200);
  return response.end();
});

// POST - update item quantity in cart
myRouter.post('/api/me/cart/:productId', (request, response) => {
  const { productId } = request.params;
  const currentAccessToken = getValidToken(request);

  if (!currentAccessToken) {
    // If user is not logged in, return 401 error
    return return401Error(response);
  }

  // If product ID is not a positive integer, return 400 error
  if (!isPositiveInteger(productId)) {
    return return400Error(response);
  }

  // If product does not exist, return 404 error
  if (!idExists(productId, products)) {
    return return404Error(response);
  }

  // Get current user info
  const currentUser = getCurrentUser(currentAccessToken);
  const productToUpdate = currentUser.cart.find(
    (item) => item.id === productId
  );

  // If product is not in cart, return 404 error
  if (!productToUpdate) {
    return return404Error(response);
  }

  // Otherwise, if request is valid, update product and return 200
  Object.assign(productToUpdate, request.body);
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

// Return 400 error
const return400Error = (response) => {
  response.writeHead(400);
  return response.end('Bad request. ID must be an integer and larger than 0');
};

// Return 404 error
const return404Error = (response) => {
  response.writeHead(404);
  return response.end('Specified ID was not found');
};

// Return 401 error
const return401Error = (response) => {
  response.writeHead(401);
  return response.end('Not authorized');
};

module.exports = server;
