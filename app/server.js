var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');
const users = require('../initial-data/users.json');

http.createServer(function (request, response) {
}).listen(PORT);

var PORT = 3000;
var accessTokens = [];

let router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
});


// --------------- (1) USER LOGIN REQUESTS --------------------------

// POST login request from user
router.post('/users', (req, res) => {
  if(req.login.username && req.login.password){
    let user = users.find((user) => {
      return (
        user.login.username === req.login.username &&
        user.login.password === req.login.password  
      )
    });
  } else {
    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
})


// --------- (2) BRANDS & PRODUCTS REQUESTS --------------------------


// GET Request for all products: (YES)
router.get('/products', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(products));
});

// GET Request for specific product with a given ID
router.get('/products/:id/product', (req, res) => {
  const productID = req.params.product;
  const findProduct = products.filter((product) => {
    products.categoryId === productID    
  })
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(findProduct));
});

// GET Request for all brands: (YES)
router.get('/brands', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brands));
})

// GET Request for all users: (YES)
router.get('/users', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(users));
})


// ------------- (3) CART REQUESTS  ------------------------

// GET Request to ADD item to cart
router.get('/cart/add', (req, res) => {
});

// POST Request to REMOVE item from cart
router.post('/cart/remove', (req, res) => {
});


module.exports = server;