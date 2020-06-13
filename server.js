var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;


const PORT = 3001;
let products = [];

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

myRouter.get('/brands/:id/products', function(request,response) {
	// Return all products in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(products));
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