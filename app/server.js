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
let users = [];
let accessTokens = [];

var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile("/Users/StephB/code/node-js/sunglasses-io/initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} stores loaded`);
  });

  fs.readFile("/Users/StephB/code/node-js/sunglasses-io/initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });

  fs.readFile("/Users/StephB/code/node-js/sunglasses-io/initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} users loaded`);
  });
});

myRouter.get('/api/products', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(products));
});

myRouter.get('/api/brands', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:brandId/products', function(request,response) {
  
  // check if valid brand id
  const { brandId } = request.params;
  const brand = brands.find(brand => brand.id === brandId);
  if (!brand) {
    response.writeHead(404);
    return response.end("Brand not found");
  }

	response.writeHead(200, { "Content-Type": "application/json" });
  // get product list
  const productsToReturn = products.filter(product => product.categoryId === brandId);
	return response.end(JSON.stringify(productsToReturn));
});

myRouter.post('/api/login', function(request,response) {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
    return user.login.username == request.body.username && user.login.password == request.body.password;
    });

    if (user){
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify());
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

myRouter.get('/api/me/cart', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify([]));
});

myRouter.post('/api/me/cart', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify([]));
});

myRouter.delete('/api/me/cart/:id', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify([]));
});

myRouter.put('/api/me/cart/:id', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify([]));
});

module.exports = server;