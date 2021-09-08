var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
var router = Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Array of users, States, e.g, authentication, cart
// {
//   cart: [],
//   login: {
//     username: 'philip',
//     password: 'loggedin'
//   }
// }
let users = [];
let brands = [];
let products = [];
let loggedInUser = undefined;

http.createServer(function (request, response) {
  router(request, response, finalHandler(request, response));
}).listen(PORT, () => {
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  loggedInUser = users[0];

  // Read the brands file
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  //  Read the products file
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));

});

// Frontend
// localhost: 3000 -> UI -> get me all the brands from API -> localhost:3001/api/brands -> render
// fetch( like in "openweathermap.com/....")
// API
// localhost: 3001 -> API

// localhost:3001/

// localhost:3001/api/brands
router.get('/api/brands', function (req, res) {
  console.log('hit brand');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(JSON.stringify(brands));
});

// Get all the products matching the brand id = categoryId
router.get('/api/brands/:id/products', function (req, res) {
  const { id } = req.params;
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  const brandProducts = [];

  for (let i = 0; i < products.length; i++) {
    console.log(products[i])
    if (products[i].categoryId === id) {
      brandProducts.push(products[i]);
    }
  }

  res.end(JSON.stringify(brandProducts));
});

//GET products
router.get('/api/products', function (req, res) {
  console.log('get the products');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(JSON.stringify(products))
});

//POST login, still need to mock data.
router.post('/api/login', function (req, res) {
  console.log('user login');
  if (req.body.username && req.body.password) {
    loggedInUser = users.find(user => {
      return (
        user.login.username == req.body.username &&
        user.login.password == req.body.password
      )
    });
  }
});

//GET cart
router.get('/api/me/cart', function (req, res) {
  console.log('get the cart items');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(JSON.stringify(loggedInUser.cart));
});

// POST /api/me/cart
router.post('/api/me/cart', function (req, res) {
  console.log('adding items to the cart');

  let productId = req.body.productId;

  // TODO: Increment quantity by 1 instead of adding a duplicated product if the same product already exists in the cart.
  const product = products.find(p => p.id === productId);
  product.quantity = 1;

  loggedInUser.cart.push(product);
  res.writeHead(200, { "Content-Type": "application/json"});
  res.end(JSON.stringify(loggedInUser.cart));
});

// POST /api/me/cart/:productId
router.post('/api/me/cart/:productId', function (req, res) {
  console.log('change quantity of this product');

  // TODO
  const quantity = req.body.quantity;

  let productInTheCart = loggedInUser.cart.find((c) => {
    return c.id === req.params.productId;
  });

  productInTheCart.quantity = quantity;

  res.writeHead(200, { "Content-Type": "application/json"});
  res.end(JSON.stringify(loggedInUser.cart));
});

// DELETE /api/me/cart/:productId
router.delete('/api/me/cart/:productId', function(req, res) {
  console.log("delete the product from card");
  const productIndex = loggedInUser.cart.findIndex((c) => {
    return c.id === req.params.productId;
  });
  // Remove the product from the array
  if (productIndex >= 0) {
    loggedInUser.cart.splice(productIndex, 1);
  }

  res.writeHead(200, { "Content-Type": "application/json"});
  res.end(JSON.stringify(loggedInUser.cart));
});
