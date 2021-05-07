var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const Store = require('./store')

//state holding variables
var brands = [];
var users = [];
var products = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());


let server = http.createServer(function (request, response) {
  	myRouter(request, response, finalHandler(request, response))
}).listen(3002, (error) => {
	if (error) {
		return console.log('Error starting server:', errror)
	}
	fs.readFile('brands.json', 'utf8', function (error, data) {
		if (error) throw (error);
		brands = JSON.parse(data);
		console.log(`Server set up: ${brands.length} brands loaded`);
	});
	fs.readFile('products.json', 'utf8', function (error, data) {
		if (error) throw (error);
		products = JSON.parse(data);
		console.log(`Server set up: ${products.length} products loaded`);
	});
	fs.readFile('users.json', 'utf8', function (error, data) {
		if (error) throw (error);
		users = JSON.parse(data);
		console.log(`Sever set up: ${users.length} user loaded`);
	})

});

myRouter.get('/brands', function(request,response) {
	// Return all brands in the db
	return response.end(JSON.stringify('test')
)})

module.exports = server;