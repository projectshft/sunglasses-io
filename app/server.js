var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
//const TOKEN_VALIDITY_TIMEOUT = 900000 // 15 minutes
const PORT = 3001;
// states
brands = [];
products = [];
users = [];
cart = [];
//var accessTokens = [];
//var failedLoginAttempts = {};

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
//before any REST requests, validation could happen here

// 
//route commands to myRouter
myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
 // load data upon verifing server is a go 
 // load Brands data
fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
  if (error) throw error;
  brands = JSON.parse(data);
  console.log(`Server setup: ${brands.length} Brands loaded`);
});

// load Products data
fs.readFile("initial-data/products.json", "utf8", (error, data) => {
  if (error) throw error;
  products = JSON.parse(data);
  console.log(`Server setup: ${products.length} Products loaded`);
});

// load Users data
fs.readFile("initial-data/users.json", "utf8", (error, data) => {
  if (error) throw error;
  users = JSON.parse(data);
  console.log(`Server setup: ${users.length} Users loaded`);
}); 
  
console.log(`Server ready on ${PORT}`);
});


// Routing starts

// Public route - no login required
// Brands
// -List of all brands
// -List first X brands in list with number query
myRouter.get('/api/brands/', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  var parsedUrl = require('url').parse(request.url,true)
  if (parsedUrl.query.number) {
    return response.end(JSON.stringify(brands.slice(0,parsedUrl.query.number)));
  } else {
    return response.end(JSON.stringify(brands));
}});
// -Return all products of a specified brandId
myRouter.get('/api/brands/:brandId/products', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  // console.log('proper parsing test ', parsedUrl);
  // console.log('query test', request.params.brandId)
  if (request.params.brandId) {
    let niceResults = products.filter(item => item.categoryId===request.params.brandId);
    return response.end(JSON.stringify(niceResults));
  } else {
    // TODO return error
    return response.end(JSON.stringify(products));
}});
// Products
// -List all products
// -Return product search results with search params
myRouter.get('/api/products', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  var parsedUrl = require('url').parse(request.url,true)
  console.log('proper parsing test ', parsedUrl);
  if (parsedUrl.query.search) {
    let niceResults = products.filter(item => item.name===parsedUrl.query.search);
    // TODO make a robust search of some type
    return response.end(JSON.stringify(niceResults));
  } else {
    return response.end(JSON.stringify(products));
}});    

// Login
// -Verify username and password, issue token
myRouter.get('/api/login', function(request,response) {
  response.writeHead(418, { "Content-Type": "application/json" });
  var parsedUrl = require('url').parse(request.url,true)
  console.log('proper parsing test ', parsedUrl);
  if (parsedUrl.query.username && parsedUrl.query.password) {
    
    // TODO integrate login code
    
  } else {
    return response.end('TODO Fail Message');
}});    

// Cart -- login required
// -Verify valid token, then allow access
myRouter.get('api/cart', function(request,response) {
  response.writeHead(418, { "Content-Type": "application/json" });
  // check for token
  // else send login required error 401
});
// -Add product to shopping cart
myRouter.post('api/cart', function(request,response) {
  response.writeHead(418, { "Content-Type": "application/json" });
  // check for token
  // add product to cart (parseUrl)
  // else send login required error 401
});
// -Update quantity of product in cart
myRouter.post('api/cart/:prodId', function(request,response) {
  response.writeHead(418, { "Content-Type": "application/json" });
  // parseUrl and params
  // check for token
  // check for existing product
  // increment product to cart
  // else send login required error 401
});
// -Delete product from cart
myRouter.delete('api/cart/:prodId', function(request,response) {
  response.writeHead(418, { "Content-Type": "application/json" });
  // parseUrl and params
  // check for token
  // check for existing product
  // increment product to cart
  // else send login required error 401
});
module.exports = server; 