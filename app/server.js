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

const PORT = 3001;

http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request,response)) 

}).listen(PORT);

// Get Brands
myRouter.get('/brands', function(request,response) {
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
myRouter.post('/me/cart', function(requets, response) {

});

// Delete Product in Cart
myRouter.delete('/me/cart/:productId', function(request,response) {

});

// Post Product to Cart
myRouter.post('me/cart/:productId', function(request, response) {

});