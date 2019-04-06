var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

let brands = [];
let users = [];
let products = [];

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication" };

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  if (request.method === 'OPTIONS') {
    response.writeHead(200, CORS_HEADERS);
    response.end();
  }
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} stores loaded`);
  });

  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} users loaded`);
  });

  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// Route to get every brand type
myRouter.get('/brands', (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.writeHead(200, CORS_HEADERS);
  response.end(JSON.stringify(brands));
});

// Route to get products for a single brand
myRouter.get('/brands/:brandId/products', (request, response) => {
  response.setHeader('Content-Type', 'application/json');

  // return every product for a single brand by using the id
  product = products.filter((product => product.categoryId == request.params.brandId));
  if (product.length === 0) {
    response.writeHead(404, CORS_HEADERS);
    return response.end(JSON.stringify({ message: 'No products found' }));
  }
  response.writeHead(200, CORS_HEADERS);
  response.end(JSON.stringify(product));
});

myRouter.get('/products', (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.writeHead(200, CORS_HEADERS);
  response.end(JSON.stringify(products));
});

module.exports = server;