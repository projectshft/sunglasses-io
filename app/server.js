var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var url = require('url');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const Product = require('../models/products.js');
const Brand = require('../models/brands.js');
const User = require('../models/users.js');
const TOKEN_EXPIRATION = 30 * 60 * 1000; // 30 minutes

const getValidTokenFromRequest = function(request) {
  const parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {

    // Verify the access token to make sure it's valid and not expired
    
    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.hash == parsedUrl.query.accessToken && new Date() - accessToken.lastUpdated < TOKEN_EXPIRATION;
    });

    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const sampleToken = require('../data/uids');
let accessTokens = [];

const contentHeader = { "Content-Type": "application/json" }
const myRouter = Router();
myRouter.use(bodyParser.json());
const PORT = 3001;

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
})

server.listen(PORT, () => {
  User.load();
  Product.load();
  Brand.load();
  sampleToken.lastUpdated = new Date();
  accessTokens.push(sampleToken);
});

myRouter.get('/api/sunglasses', (request, response) => {
  const query = queryString.parse(url.parse(request.url).query);
  const search = query.search;
  const inStock = query.inStock;

  let results = Product.getAll();

  if (inStock && !['true', 'false'].includes(inStock)) {
    response.writeHead(400, 'The inStock query must be either "true" or "false."');
    return response.end();
  } else if (inStock === 'true') {
    results = results.filter((product) => product.inStock)
  } else if (inStock === 'false') {
    results = results.filter((product) => !product.inStock)
  }

  if (search) {
    results = results.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) || product.description.toLowerCase().includes(search.toLowerCase()));
    response.writeHead(200, contentHeader);
    return response.end(JSON.stringify(results));
  } else if (search === '') {
    response.writeHead(400, 'No empty search string allowed.');
    return response.end();
  }

  response.writeHead(200, contentHeader);
  return response.end(JSON.stringify(results));
});

myRouter.get('/api/sunglasses/:glassId', (request, response) => {
  const productId = request.params.glassId;

  const pair = Product.get(productId);

  if (!pair) {
    response.writeHead(404, 'No product was found with that id, or the id was invalid.');
    response.end();
  }

  response.writeHead(200, contentHeader);
  return response.end(JSON.stringify(pair));
});

myRouter.get('/api/brands', (request, response) => {
  response.writeHead(200, contentHeader);
  return response.end(JSON.stringify(Brand.getAll()));
});

myRouter.get('/api/brands/:brandId/sunglasses', (request, response) => {
  const brandId = request.params.brandId;

  const result = Product.getAll().filter((product) => product.brandId === brandId);

  if (result.length === 0) {
    response.writeHead(404, 'No brand was found matching the given id.');
    return response.end();
  }

  response.writeHead(200, contentHeader);
  return response.end(JSON.stringify(result));
});

myRouter.post('/api/login', (request, response) => {
  const { username, password } = request.body;

  const users = User.getAll();
  const loginAttempt = users.find((user) => username === user.login.username && password === user.login.password);

  // if the username/password are correct
  if (loginAttempt) {

    const token = accessTokens.find((token) => username === token.username)
    if (token) {

      if (new Date() - token.lastUpdated > TOKEN_EXPIRATION) {
        // update the token
        token.hash = uid(16);
        token.lastUpdated = new Date();
      }
      response.writeHead(200, contentHeader);
      response.write(JSON.stringify(token.hash));

    } else {

      // if there is not a token, create a new one.
      const newToken = {
        username: username,
        hash: uid(16),
        lastUpdated: new Date()
      };
      accessTokens.push(newToken);
      response.writeHead(200, contentHeader);
      response.write(JSON.stringify(newToken.hash));

    }
    
  } else {
    response.writeHead(401, 'Username and/or password are incorrect.');
  }

  return response.end();
});

myRouter.get('/api/me/cart', (request, response) => {
  const validatedToken = getValidTokenFromRequest(request);

  if (validatedToken) {
    const user = User.getAll().find((user) => validatedToken.username === user.login.username)
    response.writeHead(200, contentHeader);
    response.write(JSON.stringify(User.getCart(user.id)));
  } else {
    response.writeHead(401, 'A valid access token is required for that request.');
  }

  return response.end();
});

myRouter.post('/api/me/cart/:glassId/add', (request, response) => {
  const validatedToken = getValidTokenFromRequest(request);
  const productId = request.params.glassId;
  const quantity = queryString.parse(url.parse(request.url).query).quantity;

  if (validatedToken) {
    const user = User.getAll().find((user) => validatedToken.username === user.login.username);
    if (Product.get(productId)) {
      if (quantity && isNaN(quantity)) {
        response.writeHead(400, 'Quantity must be an integer')
      } else if (quantity && parseInt(quantity) <= 50) {
        const addedItems = User.addCartItem(user.id, productId, parseInt(quantity));
        response.writeHead(200, contentHeader);
        response.write(JSON.stringify(addedItems));
      } else if (quantity && parseInt(quantity) > 50) {
        response.writeHead(400, 'Too many items.');
      } else {
        const addedItems = User.addCartItem(user.id, productId);
        response.writeHead(200, contentHeader);
        response.write(JSON.stringify(addedItems));
      }

    } else {
      response.writeHead(404, 'Invalid product id, or no product with that id found.')
    }

  } else {
    response.writeHead(401, 'A valid token is required to perform that action.')
  }
  
  return response.end();
});

myRouter.delete('/api/me/cart/:glassId/remove', (request, response) => {
  const validatedToken = getValidTokenFromRequest(request);
  const productId = request.params.glassId;
  const quantity = queryString.parse(url.parse(request.url).query).quantity;

  if (validatedToken) {
    const user = User.getAll().find((user) => validatedToken.username === user.login.username);
    if (Product.get(productId)) {
      if (quantity && isNaN(quantity)) {
        response.writeHead(400, 'Quantity must be an integer')
      } else if (quantity) {
        const removedItems = User.removeCartItem(user.id, productId, parseInt(quantity));
        response.writeHead(200, contentHeader);
        response.write(JSON.stringify(removedItems));
      } else {
        const removedItems = User.removeCartItem(user.id, productId);
        response.writeHead(200, contentHeader);
        response.write(JSON.stringify(removedItems));
      }

    } else {
      response.writeHead(404, 'Invalid product id, or no product with that id found.')
    }

  } else {
    response.writeHead(401, 'A valid token is required to perform that action.')
  }
  
  return response.end();
});

myRouter.post('/api/me/cart/:glassId/update', (request, response) => {
  return response.end();
});

module.exports = server;