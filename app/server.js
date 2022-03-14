// const queryString = require('querystring');

const http = require('http');
const Router = require('router');
const bodyParser = require('body-parser');
const finalHandler = require('finalhandler');
const fs = require('fs');
const { uid } = require('rand-token');

// const Product = require('./models/productModel');

const PORT = 3001;
const myRouter = Router();

myRouter.use(bodyParser.json());

let products;
let listOfProductIds;
let brands;
let cart = [];

const server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
    listOfProductIds = products.map((product) => product.id);
    brands = JSON.parse(fs.readFileSync('./data/brands.json', 'utf-8'));
  });

myRouter.get('/products', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

myRouter.get('/brands', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

myRouter.get('/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(
    JSON.stringify(products.filter((product) => product.brandId === brandId))
  );
});

myRouter.post('/api/login', (request, response) => {
  // Make sure there is a username and password in the request
  if (
    request.body.username &&
    request.body.password &&
    getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3
  ) {
    // See if there is a user that has that username and password
    const user = users.find(
      (user) =>
        user.login.username == request.body.username &&
        user.login.password == request.body.password
    );

    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumberOfFailedLoginRequestsForUsername(request.body.username, 0);

      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(
        200,
        Object.assign(CORS_HEADERS, { 'Content-Type': 'application/json' })
      );

      // We have a successful login, if we already have an existing access token, use that
      const currentAccessToken = accessTokens.find(
        (tokenObject) => tokenObject.username == user.login.username
      );

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      }
      // Create a new token with the user value and a "random" token
      const newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      accessTokens.push(newAccessToken);
      return response.end(JSON.stringify(newAccessToken.token));
    }
    // Update the number of failed login attempts
    let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(
      request.body.username
    );
    setNumberOfFailedLoginRequestsForUsername(
      request.body.username,
      ++numFailedForUser
    );
    // When a login fails, tell the client in a generic way that either the username or password was wrong
    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
  // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
  response.writeHead(400, 'Incorrectly formatted response');
  return response.end();
});

// Helper method to process access token
const getValidTokenFromRequest = function (request) {
  const parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure its valid and not expired
    const currentAccessToken = accessTokens.find(
      (accessToken) =>
        accessToken.token == parsedUrl.query.accessToken &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
    );
    if (currentAccessToken) {
      return currentAccessToken;
    }
    return null;
  }
  return null;
};

myRouter.get('/me/cart', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cart));
});

myRouter.post('/me/cart', (request, response) => {
  cart = request.body;

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cart));
});

myRouter.post('/me/cart/:productId', (request, response) => {
  const { productId } = request.params;

  if (!productId) {
    response.writeHead(400);
    return response.end();
  }
  if (!listOfProductIds.includes(productId)) {
    response.writeHead(404);
    return response.end('Product not found');
  }

  const productToAdd = cart.find((product) => product.id === productId);
  cart.push(productToAdd);

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cart));
});

module.exports = server;
