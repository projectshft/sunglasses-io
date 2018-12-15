const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;

// State
let brands = [];
let products = [];
let users = [];
let currentUser = {};
let accessTokens = [];
const PORT = 3001;

// Setup state
fs.readFile('initial-data/brands.json', 'utf-8', (err, data) => {
  if (err) throw err;
  brands = JSON.parse(data);
});

fs.readFile('initial-data/products.json', 'utf-8', (err, data) => {
  if (err) throw err;
  products = JSON.parse(data);
});

fs.readFile('initial-data/users.json', 'utf-8', (err, data) => {
  if (err) throw err;
  users = JSON.parse(data);
  currentUser = users[0];
});

const failedLogins = {}; // username: 0

const getFailedLogins = username => {
  let numFails = failedLogins[username];
  return numFails ? numFails : 0;
};

const setFailedLogins = (username, numFails) => {
  failedLogins[username] = numFails;
};

// Setup router
const router = Router();
router.use(bodyParser.json());

// Setup server
const server = http
  .createServer((req, res) => {
    res.writeHead(200);
    router(req, res, finalHandler(req, res));
  })
  .listen(PORT);

// ********************* BRANDS ROUTES ********************* //

// GET all brands
router.get('/api/brands', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(brands));
});

// GET products by brand
router.get('/api/brands/:id/products', (req, res) => {
  let brandId = req.params.id;
  let brandProducts = products.filter(product => {
    return product.brandId === brandId;
  });

  if (brandProducts.length === 0) {
    res.writeHead(401, 'No products with that brand found');
    res.end();
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(brandProducts));
});

// ********************* PRODUCTS ROUTES ********************* //

// GET all products
router.get('/api/products', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(products));
});

// ********************* USER'S CART ROUTES ********************* //

// GET user cart
router.get('/api/me/cart', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(currentUser.cart));
});

// POST (Add) to cart
router.post('/api/me/cart', (req, res) => {
  let product = req.body;
  if (Object.keys(product).length === 0) {
    res.writeHead(401, 'No product selected');
    res.end();
  } else {
    currentUser.cart.push(product);

    res.end(JSON.stringify(product)); // return product added to cart
  }
});

// Update product (quantity) in cart
router.post('/api/me/cart/:productId', (req, res) => {
  // Grab product from cart
  let product = currentUser.cart.filter(
    item => item.id === req.params.productId
  );

  if (!product) {
    res.writeHead(401, 'No product selected');
    res.end();
  } else {
    // Update user's cart
    currentUser.cart.map(item => {
      if (product.id === item.id) {
        item.quantity = req.body.quantity;
        return item;
      }
    });
    res.writeHead(200, { 'Content-Type': 'application:json' });
    res.end(JSON.stringify(product)); // Updated product
  }
});

// Delete product from cart
router.delete('/api/me/cart/:productId', (req, res) => {
  // Grab product from cart
  let product = currentUser.cart.filter(
    item => item.id === req.params.productId
  );

  if (!product) {
    res.writeHead(401, 'No product selected');
    res.end();
  } else {
    // Delete product
    currentUser.cart.splice(currentUser.cart[req.params.productId], 1);
    res.writeHead(200, { 'Content-Type': 'application:json' });
    res.end();
  }
});

// ********************* LOGIN ROUTE ********************* //
router.post('/api/login', (req, res) => {
  // Make sure there is a username and password in the request
  if (
    req.body.username &&
    req.body.password &&
    getFailedLogins(req.body.username) < 3
  ) {
    // See if there is a user that has that username and password
    let user = users.find(user => {
      return (
        user.login.username === req.body.username &&
        user.login.password === req.body.password
      );
    });

    if (user) {
      // Reset number of fails
      setFailedLogins(user.login.username, 0);

      // Write the header because we know we will be returning successful at this point and that the response will be json
      res.writeHead(200, { 'Content-Type': 'application/json' });

      // If we already have an existing access token, use that
      let accessToken = accessTokens.find(token => {
        return token.username === user.login.username;
      });

      if (accessToken) {
        // Update the last updated value of the existing token so we get another time period before expiration
        accessToken.lastUpdated = new Date();
        res.end(JSON.stringify(accessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newToken = {
          lastUpdated: new Date(),
          token: uid(16),
          username: user.login.username
        };

        accessTokens.push(newToken);
        res.end(JSON.stringify(newToken.token));
      }
    } else {
      // Increase number of failed logins
      let currentFails = getFailedLogins(req.body.username);
      setFailedLogins(req.body.username, (currentFails += 1));

      // When a login fails, tell the client in a generic way that either the username or password was wrong
      res.writeHead(401, 'Invalid username or password');
      res.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    res.writeHead(400, 'Incorrectly formatted response');
    res.end();
  }
});

module.exports = { server, currentUser };
