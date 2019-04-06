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

http.createServer(function (request, response) {
	myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
	if (error) {
		return console.log("Error on Server Startup: ", error);
	}
	fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
		if (error) throw error;
		brands = JSON.parse(data);
		console.log(`Server setup: ${brands.length} brands loaded`);
	});
	fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
		if (error) throw error;
		users = JSON.parse(data);
		console.log(`Server setup: ${users.length} users loaded`);
	});
	fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
		if (error) throw error;
		products = JSON.parse(data);
		console.log(`Server setup: ${products.length} products loaded`);
	});
	console.log(`Server is listening on ${PORT}`);
});

myRouter.get("/", (request, response) => {
  response.end("server working");
});

myRouter.get('/api/brands', function(request,response) {
	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:brandId/products', function(request,response) {
	requestedBrandProducts = products.filter(product => product.categoryId === request.params.brandId)
	if (requestedBrandProducts.length != 0) {
		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end(JSON.stringify(requestedBrandProducts));
	} else {
		response.writeHead(404, "Brand id not found");
		response.end();
	}
});