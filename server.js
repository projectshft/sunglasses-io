var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// State holding variables
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {

  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => { 
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });

  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if(error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  })
  
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
});

myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  console.log("get(/api/brands): ");
  console.log(brands);
  return response.end(JSON.stringify(brands));

});

myRouter.get('/api/brands/:id/products', function(request, response) {
  // variable for brand with associated :id
  const brandSelection = brands.find((brand) => {
    return brand.id == request.params.id;
  });
  // handles case of undefined brandSelection variable due to invalid :id brand
  if(!brandSelection){
    response.writeHead(500);
    return response.end("Brand not found, no products found.");
  }
  // variable for products associated with brand :id
  const brandProducts = products.filter((products) => {
    return products.categoryId == brandSelection.id;
  });

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brandProducts));
});

myRouter.get('/api/products', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(products));
});

myRouter.post('/api/login', function(request, response) {
  const usernameInput = users.find() 
});

myRouter.get('/api/me/cart', function(request, response) {

});

myRouter.post('/api/me/cart', function(request, response) {

});

myRouter.delete('/api/me/cart/:productId', function(request, response) {

});

myRouter.post('/api/me/cart/:productId', function(request, response) {

});

module.exports = server;