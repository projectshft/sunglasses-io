var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// // Created with https://www.uuidgenerator.net/
// const VALID_API_KEYS = ["e633b606 - b480 - 11e8 - 96f8 - 529269fb1459",
// "e633b89a - b480 - 11e8 - 96f8 - 529269fb1459",
// "e633b9ee - b480 - 11e8 - 96f8 - 529269fb1459"];


//State holding variables
var brands = [];
var users = [];
var products = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//create server and set it to listen to the port variable value
http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

//the GET/api/brands does not take parameters and sends back an array of brands
myRouter.get('/api/brands', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }));
  response.end(JSON.stringify(brands));
});

