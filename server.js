var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;


const PORT = 3001;
let products = [];
let brands = [];
var accessTokens = [];

//Setup router
var myRouter = Router();

let server = http.createServer(function (request, response) {

  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

myRouter.get('/products', function(request,response) {
	// Return all products in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(products));
});

myRouter.get('/brands', function(request,response) {
	// Return all products in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(brands));
});

myRouter.get('/brands/:id/products', function(request,response) {

	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(brands));
});

myRouter.post('/products', function(request,response) {
  const addedProduct = products.push(request.body)
	
	// Return success with added product
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(addedProduct));
});

myRouter.post('/api/login', function(request,response) {


});

myRouter.get('/me/cart', function(request,response) {
	// Return all products in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(products));
});

myRouter.post('/me/cart', function(request,response) {
	// Return all products in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(products));
});


myRouter.delete('/me/cart/:productId', function(request,response) {
	// Return all products in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(products));
});

myRouter.post('/me/cart/:productId', function(request,response) {
	// Return all products in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(products));
});

module.exports = server