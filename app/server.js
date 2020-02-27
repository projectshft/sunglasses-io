var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const PORT = 3001;

// State holding variables
var brands = [];
var users = [];
var accessTokens = [];
var products = {};


// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
    if (error) {
      return console.log('Error on Server Startup: ', error)
    }
    //Reads the products.JSON file
    fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
    //Reads the brands.JSON file
    fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });
    //Reads the users.JSON file
    fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });
    //console log so I know server is up and running
    console.log(`Server is listening on ${PORT}`);
  });  


// First route to the brands. She return all brand names of sunglasses
myRouter.get('/api/brands', function(request,response) {
    response.writeHead(200, { "Content-Type": "application/json" });
	// Return all brands in the db
	return response.end(JSON.stringify(brands))
});

module.exports = server

