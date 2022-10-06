/* eslint-disable no-unused-vars */
/* eslint-disable indent */
var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var url = require('url');
var uid = require('rand-token').uid;

var brands = [];
var products = [];
var users = [];
var accessTokens = [];

const PORT = 3001;

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

let router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Server running on port ${PORT}`);
  brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf8'));
  products = JSON.parse(
    fs.readFileSync('./initial-data/products.json', 'utf8')
  );
  users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'));
});

router.get('/api/brands', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(brands));
});

router.get('/api/products', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(products));
});

router.get('/api/users', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(users));
});

router.get('/api/brands/:categoryId/products', (req, res) => {
  let categoryId = req.params.categoryId;
  if (categoryId > 0 && categoryId < 6 && isNaN(categoryId) == false) {
    let filteredProducts = [];
    filteredProducts.push(
      products.filter((product) => {
        return product.categoryId == categoryId;
      })
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(filteredProducts));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({ message: 'There are not any products for this request' })
    );
  }
});

router.post('/api/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let user = users.find((user) => {
    return user.login.username == username && user.login.password == password;
  });
  if (!user) {
    res.writeHead(401, 'Invalid username or password');
    return res.end();
  } else if (user) {
    let currentAccessToken = accessTokens.find((tokenObject) => {
      return tokenObject.username == username.login.username;
    });
    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      return res.end(JSON.stringify(currentAccessToken.token));
    } else {
      let newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      accessTokens.push(newAccessToken);
      console.log(accessTokens[0].token);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(newAccessToken));
    }
  }
});

var isTokenValid = (token) => {
  let currentAccessToken = accessTokens.find((tokenObject) => {
    return tokenObject.token == token;
  });
  if (currentAccessToken) {
    let lastUpdated = new Date(currentAccessToken.lastUpdated);
    let currentTime = new Date();
    if (currentTime - lastUpdated < TOKEN_VALIDITY_TIMEOUT) {
      return true;
    }
  }
  return false;
};

//ADD item to cart
router.post('/api/me/cart', (req, res) => {
  let token = url.parse(req.url, true).query.token;
  let addItemsToCart = req.body;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message:
          'Invalid token: You need to have access to this call to continue',
      })
    );
  } else if (
    req.body.id != null &&
    req.body.quantity != null &&
    req.body.id &&
    req.body.quantity &&
    isNaN(req.body.id) == false &&
    isNaN(req.body.quantity) == false &&
    req.body.id > 0 &&
    req.body.id < 13 &&
    req.body.quantity > 0 &&
    //limiting the purchase quantity of any single product to 5
    req.body.quantity < 6 &&
    req.body.id % 1 == 0 &&
    req.body.quantity % 1 == 0
  ) {
    let user = users[0];
    user.cart.push(addItemsToCart);
    console.log(user.cart);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(user.cart));
  } else if (req.body.id == null || req.body.id == undefined) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message: 'Please provide a valid product id',
      })
    );
  } else if (req.body.quantity == null || req.body.quantity == undefined) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message: 'Please provide a valid product quantity',
      })
    );
  } else if (isNaN(parseInt(req.body.id)) == true || isNaN((parseInt(req.body.quantity)) == true)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message: 'Please provide a valid product id and quantity',
      })
    );
  } else if (req.body.id < 1 || req.body.id > 12) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message: 'Please provide a valid product id between 1 and 12',
      })
    );
  } else if (req.body.quantity < 1 || req.body.quantity > 5) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message: 'Please provide a valid product quantity between 1 and 5',
      })
    );
  } else if (req.body.id % 1 != 0 || req.body.quantity % 1 != 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message: 'Please provide a whole number for product id and for quantity ',
      })
    );
  }
});

// VIEW items in cart
router.get('/api/me/cart', (req, res) => {
  let token = url.parse(req.url, true).query.token;
  let cartItems = users[0].cart;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message:
          'Invalid token: You need to have access to this call to continue',
      })
    );
  } else {
    console.log(cartItems);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(cartItems));
  }
});


//REMOVE item from cart
router.delete('/api/me/cart/:id', (req, res) => {
  let token = url.parse(req.url, true).query.token;
  let id = req.params.id;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message:
          'Invalid token: You need to have access to this call to continue',
      })
    );
  } else {
    let user = users[0];
    let cartItems = user.cart;
    let cartAfterRemove = cartItems[0].filter((item) => item.id !== id);
    user.cart = cartAfterRemove;
    console.log(user.cart);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(user.cart));
  }
});

//UPDATE item in cart by product id
router.post('/api/me/cart/:id', (req, res) => {
  let token = url.parse(req.url, true).query.token;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message:
          'Invalid token: You need to have access to this call to continue',
      })
    );
  } else {
    let id = req.params.id;
    if (id < 1 || id > 11 || isNaN(id)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          message: 'There are not any products for this request',
        })
      );
    } else {
      let user = users[0];
      let cartItems = user.cart;
      let cartAfterUpdate = cartItems.map((item) => {
        if (item.id == id) {
          item.quantity = req.body.quantity;
        }
        return item;
      });
      user.cart = cartAfterUpdate;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(user.cart));
    }
  }
});

module.exports = server;
