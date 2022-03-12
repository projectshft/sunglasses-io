/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const url = require('url');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const { uid } = require('rand-token');

let brands = [];
let products = [];
let users = [];
const accessTokens = [];

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf-8'));
    products = JSON.parse(
      fs.readFileSync('./initial-data/products.json', 'utf-8')
    );
    users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf-8'));
  });

myRouter.get('/brands', (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let brandsToReturn = [];
  if (query !== undefined) {
    brandsToReturn = brands.filter((brand) => brand.name.includes(query));

    if (!brandsToReturn) {
      response.writeHead(404, 'Brand not found');
      return response.end();
    }
  } else {
    brandsToReturn = brands;
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brandsToReturn));
});

myRouter.get('/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;
  const brand = brands.find((brands) => brands.id === brandId);
  if (!brand) {
    response.writeHead(404, 'That brand does not exist');
    return response.end();
  }
  const brandProducts = products.filter(
    (products) => products.brandId === brandId
  );
  const finalReturn = { brand: brand.name, products: [...brandProducts] };
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(finalReturn));
});

myRouter.get('/products', (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let productsToReturn = [];
  if (query !== undefined) {
    productsToReturn = products.filter((product) =>
      product.description.includes(query)
    );

    if (!productsToReturn) {
      response.writeHead(404, 'Product not found');
      return response.end();
    }
  } else {
    productsToReturn = products;
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(productsToReturn));
});

myRouter.post('/login', (request, response) => {
  if (request.body.username && request.body.password) {
    const user = users.find(
      (user) =>
        user.login.username == request.body.username &&
        user.login.password == request.body.password
    );
    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      const currentAccessToken = accessTokens.find(
        (tokenObject) => tokenObject.username == user.login.username
      );

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      }
      const newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      accessTokens.push(newAccessToken);
      return response.end(JSON.stringify(newAccessToken.token));
    }
    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
  response.writeHead(400, 'Incorrectly formatted response');
  return response.end();
});

const getValidTokenFromRequest = function (request) {
  const parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
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
  const currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'You must be logged in to view your cart');
    return response.end();
  }

  const user = users.find(
    (user) => user.login.username === currentAccessToken.username
  );

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(user.cart));
});

myRouter.post('/me/cart/', (request, response) => {
  const currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, 'You must be logged in to access your cart');
    return response.end();
  }
  const productId = request.params.id;
  const product = products.find((product) => product.id == productId);

  const user = users.find(
    (user) => user.login.username === currentAccessToken.username
  );
  user.cart.push(product);

  response.writeHead(200), { 'Content-Type': 'application/json' };
  return response.end(JSON.stringify(product));
});

myRouter.delete('/me/cart/:productId', (request, response) => {
  const currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, 'You must be logged in to access your cart');
    return response.end();
  }
  const user = users.find(
    (user) => user.login.username === currentAccessToken.username
  );
  const productId = request.params.id;
  const productToDelete = user.cart.find((product) => product.id == productId);
  if (!productToDelete) {
    response.writeHead(404, 'Product not found');
    return response.end();
  }

  user.cart.splice(productToDelete, 1);
  response.writeHead(200), { 'Content-Type': 'application/json' };
  return response.end(JSON.stringify(user.cart));
});

myRouter.put('/me/cart/:productId', (request, response) => {
  const currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, 'You must be logged in to access your cart');
    return response.end();
  }
  const user = users.find(
    (user) => user.login.username === currentAccessToken.username
  );
  const productId = request.params.id;
  const productToUpdate = user.cart.find((product) => product.id == productId);
  if (!productToUpdate) {
    response.writeHead(404, 'Product not found');
    return response.end();
  }

  // user.cart.splice(productToDelete, 1);
  response.writeHead(200), { 'Content-Type': 'application/json' };
  return response.end(JSON.stringify(user.cart));
});

module.exports = server;
