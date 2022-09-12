const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const { uid } = require('rand-token');
const urlParser = require('url');
const { parse } = require('path');

const PORT = 3001;

// write a test for the first request
// read in our initial-data files
// add that data to some kind of variable or data structure
// make simple functions to deal with that data
// make the test pass
// write another test and repeat 2-5 until done

let users = [];
let brands = [];
let products = [];
const accessTokens = [];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    if (error) {
      return console.log('Error on Server Startup: ', error);
    }
    fs.readFile('./initial-data/brands.json', 'utf8', (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });

    fs.readFile('./initial-data/users.json', 'utf8', (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });

    fs.readFile('./initial-data/products.json', 'utf8', (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} users loaded`);
    });
  });

myRouter.get('/api/brands', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:id/products', (request, response) => {
  const { id } = request.params;
  const searchedBrand = brands.find((brand) => brand.id === id);

  if (!searchedBrand) {
    response.writeHead(404, `There was no brand found with the id of ${id}`);
    response.end();
  }
  const searchedProducts = products.filter(
    (product) => product.categoryId === searchedBrand.id
  );

  if (!searchedProducts) {
    response.writeHead(
      404,
      `There were no products found in ${searchedBrand.name}`
    );
    response.end();
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(searchedProducts));
});

myRouter.get('/api/products', (request, response) => {
  const parsedUrl = urlParser.parse(request.url, true);
  if (parsedUrl.query.query) {
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(parsedUrl.query.query)
    );
    if (filteredProducts.length === 0) {
      response.writeHead(404, 'No product found with the entered query');
      return response.end();
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(filteredProducts));
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

myRouter.post('/api/login', (request, response) => {
  if (request.body.username && request.body.password) {
    const authorizedUser = users.find(
      (user) =>
        user.login.username === request.body.username &&
        user.login.password === request.body.password
    );

    if (!authorizedUser) {
      response.writeHead(401, 'Invalid login');
      return response.end();
    }
    // Write the header because we know we will be returning successful at this point and that the response will be json
    response.writeHead(200, { 'Content-Type': 'application/json' });
    // If we already have an existing access token, use that
    let authorizedToken = accessTokens.find(
      (token) => token.token === authorizedUser.login.username
    );

    if (!authorizedToken) {
      authorizedToken = {
        username: authorizedUser.login.username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      accessTokens.push(authorizedToken);
      return response.end(JSON.stringify(authorizedToken.token));
    }
    authorizedToken.lastUpdated = new Date();
    return response.end(JSON.stringify(authorizedToken.token));
  }
  response.writeHead(400, 'Missing username or password in query');
  return response.end();
});

// Helper method to process access token
const getValidTokenFromRequest = function (request) {
  const parsedUrl = urlParser.parse(request.url, true);
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

myRouter.get('/api/me/cart', (request, response) => {
  const currentAccessToken = getValidTokenFromRequest(request);
  if (currentAccessToken) {
    const currentUser = users.find(
      (user) => user.login.username === currentAccessToken.username
    );

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(currentUser.cart));
  }
  response.writeHead(401, 'Client must be logged in to perform this action');
  response.end();
});

myRouter.post('/api/me/cart', (request, response) => {
  const currentAccessToken = getValidTokenFromRequest(request);
  if (currentAccessToken) {
    if (typeof request.body.id !== 'string' || !request.body.id) {
      response.writeHead(400, 'No product id sent by client');
      return response.end();
    }
    const productToAdd = products.find(
      (product) => product.id === request.body.id
    );
    if (!productToAdd) {
      response.writeHead(404, 'Product with id not found');
      return response.end();
    }
    const currentUser = users.find(
      (user) => user.login.username === currentAccessToken.username
    );

    currentUser.cart.push({
      product: productToAdd,
      quantity: 1,
      id: productToAdd.id,
    });
    response.writeHead(200);
    response.end();
  }
  response.writeHead(401, 'Client must be logged in to perform this action');
  response.end();
});

myRouter.delete('/api/me/cart/:id', (request, response) => {
  const { id } = request.params;
  const currentAccessToken = getValidTokenFromRequest(request);
  if (currentAccessToken) {
    const currentUser = users.find(
      (user) => user.login.username === currentAccessToken.username
    );
    const productToDelete = currentUser.cart.find(
      (product) => product.id === id
    );
    if (!productToDelete) {
      response.writeHead(404, 'Product with id not found');
      return response.end();
    }

    currentUser.cart = currentUser.cart.filter(
      (product) => product.id !== productToDelete.id
    );
    response.writeHead(200);
    response.end();
  }
  response.writeHead(401, 'Client must be logged in to perform this action');
  response.end();
});

myRouter.post('/api/me/cart/:id', (request, response) => {
  const { id } = request.params;
  const currentAccessToken = getValidTokenFromRequest(request);
  if (currentAccessToken) {
    const currentUser = users.find(
      (user) => user.login.username === currentAccessToken.username
    );
    const productToUpdate = currentUser.cart.find(
      (product) => product.id === id
    );
    if (!productToUpdate) {
      response.writeHead(404, 'Product with id not found');
      return response.end();
    }
    productToUpdate.quantity = request.body.quantity;

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(productToUpdate.quantity));
  }
  response.writeHead(401, 'Client must be logged in to perform this action');
  response.end();
});
module.exports = server;
