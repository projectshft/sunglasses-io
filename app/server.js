var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;


const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((request, response) => {
  myRouter(request, response, finalHandler(request, response));
})
.listen(PORT, () => {
  products = 
    JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));
  brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('../initial-data/users.json'), 'utf-8');
  console.log(PORT);
});

// Route for Brands Endpoint
myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// Route for a specific brand's Products Endpoint
myRouter.get('/api/brands/:id/products', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// Route for a specific Product's Endpoint
myRouter.get('/api/brands/products', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// Route for a specific user's login
myRouter.post('/api/login', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});


// Route for a specific user's cart 
myRouter.get('/api/me/cart', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// Route for a user to add products to their cart
myRouter.post('/api/me/cart', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// Route for a user to delete items from their cart
myRouter.delete('/api/me/cart/productID', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// Route for a user to change quantity of items in cart
myRouter.post('/api/me/cart/productID', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

module.exports = server;
 

//questions for office hours:
//better indenting/nesting api items
//talk through definitions in api
//post vs get difference 
//