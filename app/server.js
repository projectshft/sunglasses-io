var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

//State holding variables
let brands = [];
let products = [];
let user = {};
let users = [];
let cart = [];

var myRouter = Router();
myRouter.use(bodyParser.json());

const PORT = 3001;

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request,response)) 

});

//Listen on port
server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  //populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));

});

// Get Brands
myRouter.get('/brands', function(request,response) {
  console.log(brands);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

// Get Products by Brand Id
myRouter.get('/brands/:id/products', function(request, response) {

});

// Get Products
myRouter.get('/products', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

// Post Login
myRouter.post('/login', function(request, response) {

});

// Get Cart
myRouter.get('/me/cart', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cart));
});

// Post Cart
myRouter.post('/me/cart', function(request, response) {

});

// Delete Product in Cart
myRouter.delete('/me/cart/:productId', function(request,response) {

});

// Post Product to Cart
myRouter.post('me/cart/:productId', function(request, response) {

});

module.exports = server;