var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

let brands = [];
let user = {};
let users = [];
let products = [];

const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    //console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    //console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    //console.log(`Server setup: ${users.length} users loaded`);
  });
  //console.log(`Server is listening on ${PORT}`);
});

myRouter.get('/brands', function(request,response) {
	// Return all brands in the db
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(brands));
});


module.exports = server;