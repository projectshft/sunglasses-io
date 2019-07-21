var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
var url = require('url');

const PORT = 3001;

// declare vars that will contain state
let brands = [];
let products = [];
let users = [];

// set up router
const myRouter = Router();
myRouter.use(bodyParser.json());


// create server
const server = http.createServer(function (request, response) {
	myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
	if (error) throw error;
	brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8"));
	products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf8"));
	users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf8"));
});

// GET /api/brands (return all brands available)
myRouter.get("/api/brands", (request, response) => {
	if(brands.length == 0){
		response.writeHead(404, "No brands available");
		response.end();
	}
	response.writeHead(200, "Request for brands was successful", {"Content-Type": "application/json"});
	response.end(JSON.stringify(brands));
})

// GET /api/products (return all products available when no query is provided)
myRouter.get("/api/products", (request,response) => {
	const parsedUrl = url.parse(request.url);
	const { query } = queryString.parse(parsedUrl.query);
	if (products.length == 0){
		response.writeHead(400, "Products not available");
		response.end();
	}

	let productsReturnedByQuery = [];
	// make sure that if the query is empty that a 404 error is returned, otherwise send a successfull response
	if(query !== undefined){
		productsReturnedByQuery = products.filter(product =>
			product.name.includes(query) || product.description.includes(query));
		if(productsReturnedByQuery.length == 0){
			response.writeHead(404, "No products that match that query");
			response.end();
		}
	}else{
		productsReturnedByQuery = products;
	}
	response.writeHead(200, "Request for products was successful", {"Content-Type": "application/json"});
	response.end(JSON.stringify(productsReturnedByQuery));
})

// GET /api/brands/:id/products (returns all products of a specific brand by brand ID)
myRouter.get("/api/brands/:id/products", (request, response) => {
	const{ id } = request.params;
	const productsByBrandId = products.filter(product => 
		product.categoryId === id);
	if(productsByBrandId.length == 0){
		response.writeHead(404, "No products available or brand ID incorrect");
		response.end();
	}
	response.writeHead(200, "Request for products by brand was successful", {"Content-Type": "application/json"});
	response.end(JSON.stringify(productsByBrandId));
})

// export server to use in server-test file
module.exports = server;