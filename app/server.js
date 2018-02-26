var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
// Setup router
var router = Router();
router.use(bodyParser.json());

var brands;
fs.readFile('brands.json', (err, data) => {
  if (err) throw err;
  brands = JSON.parse(data);
  // brand = brands[0];
});
var products;
fs.readFile('products.json', (err, data) => {
  if (err) throw err;
  products = JSON.parse(data);
  // brand = brands[0];
});
var users;
fs.readFile('users.json', (err, data) => {
  if (err) throw err;
  users = JSON.parse(data);
  // brand = brands[0];
});

http.createServer(function (req, res) {
  router(req, res, finalHandler(req, res));
}).listen(PORT);
console.log("Server is listening...");

router.get('/api/products', (request, response) => {
  console.log(products)
  response.end(JSON.stringify(products));
});

router.get('/api/brands', (request, response) => {
  console.log(brands)
  response.end(JSON.stringify(brands));
});

router.get('/api/brands/:id/products', (request, response) => {
  console.log(brands)
  response.end(JSON.stringify(brands));
});

router.post('/api/login', (request, response) => {

  response.end('Logged in');
});

router.get('/api/me/cart', (request, response) => {
  console.log(users[0].cart)
  response.end(JSON.stringify(users[0].cart));
});

router.post('/api/me/cart', (request, response) => {
  response.end("Cart sent to checkout");
  
});
router.delete('/api/me/cart/:productId', (request, response) => {
  
  response.end("Product deleted from cart");
});

router.post('/api/me/cart/:productId', (request, response) => {
  response.end("Product added to cart");
  
});