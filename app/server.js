var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
//var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
//var uid = require('rand-token').uid;
//const Store = require('./store')

//state holding variables
let brands = [];
let users = [];
let products = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());


let server = http.createServer(function (request, response) {
  	myRouter(request, response, finalHandler(request, response))
}).listen(3005, error => {
	if (error) {
		return console.log('Error starting server:', errror)
	}
	brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf8'))
	products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf8'))
	users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'))
});

myRouter.get('/api/brands', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
})

myRouter.get('/api/products', function(request, response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(products))
})

module.exports = server;