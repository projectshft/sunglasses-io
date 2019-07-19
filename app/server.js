var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// declare vars that will contain state
let brands = [];
let products = [];
let users = [];

// set up router
const myRouter = Router();
myRouter.use(bodyParser.json());



http.createServer(function (request, response) {
	myRouter(request, response, finalHandler(request, response));

}).listen(PORT, error => {
	if (error) {
		return console.log('Server startup error: ', error);
	}
	fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
		if (error) throw error;
		brands = JSON.parse(data);
		console.log(`Server startup: ${brands.length} brands loaded`);
	});
	fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
		if (error) throw error;
		products = JSON.parse(data);
		console.log(`Server startup: ${products.length} products loaded`);
	});
	fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
		if (error) throw error;
		users = JSON.parse(data);
		console.log(`Server startup: ${users.length} users loaded`);
	});
});