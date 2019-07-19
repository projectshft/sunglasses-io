var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

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

// GET /api/brands (give the user all brands available)
myRouter.get("/api/brands", (request, response) => {
	response.writeHead(200, {"Content-Type": "applicatoin/json"});
	response.end(JSON.stringify(brands));
})

module.exports = server;