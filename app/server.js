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
  if (categoryId > 0 && categoryId < 6) {
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
  if (user) {
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
  let token = url.parse(req.url,true).query.token;
  let cart = req.body;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Token is invalid' }));
  } else {
    console.log(cart);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(cart));
  }
});

// VIEW items in cart
router.get('/api/me/cart', (req, res) => {
  let token = url.parse(req.url,true).query.token;
  let cart = [];
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Token is invalid' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(cart));
  }
});

//REMOVE item from cart
router.delete('/api/me/cart/:id', (req, res) => {
  let token = url.parse(req.url,true).query.token;
  let id = req.params.id;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Token is invalid' }));
  } else {
    users[0].cart = users[0].cart.filter((item) => {
      return item.id != id;
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(users[0].cart));
  }
});

//UPDATE item in cart
router.put('/api/me/cart/:id', (req, res) => {
  let token = url.parse(req.url,true).query.token;
  let id = req.params.id;
  let quantity = req.body.quantity;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Token is invalid' }));
  } else {
    users[0].cart = users[0].cart.map((item) => {
      if (item.id == id) {
        item.quantity = quantity;
      }
      return item;
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(users[0].cart));
  }
});

//change QUANTITY of item in cart
// router.put('/api/me/cart/:id', (req, res) => {
//   let token = url.parse(req.url,true).query.token;
//   let id = req.params.id;
//   let quantity = req.body.quantity;
//   if (isTokenValid(token) == false) {
//     res.writeHead(401, { 'Content-Type': 'application/json' });
//     return res.end(JSON.stringify({ message: 'Token is invalid' }));
//   } else {
//     let item = cart.find((item) => {
//       return item.id == id;
//     });
//     if (item) {
//       item.quantity = quantity;
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       return res.end(JSON.stringify(`Quantity of item ${id} changed to ${quantity}`));
//     } else {
//       res.writeHead(404, { 'Content-Type': 'application/json' });
//       return res.end(JSON.stringify({ message: 'Item not found' }));
//     }
//   }
// });

// router.post('/api/me/cart/:id', (req, res) => {
//   let token = url.parse(req.url,true).query.token;
//   let id = req.params.id;
//   let quantity = req.body.quantity;
//   if (isTokenValid(token) == false) {
//     res.writeHead(401, { 'Content-Type': 'application/json' });
//     return res.end(JSON.stringify({ message: 'Token is invalid' }));
//   } else {
//     let item = cart.find((item) => {
//       return item.id == id;
//     });
//     if (item) {
//       item.quantity = quantity;
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       return res.end(JSON.stringify(item));
//     } else {
//       res.writeHead(404, { 'Content-Type': 'application/json' });
//       return res.end(JSON.stringify({ message: 'Item not found' }));
//     }
//   }
// });


module.exports = server;
