var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

let brands = require('../initial-data/brands.json');
let products = require('../initial-data/products.json');
let users = require('../initial-data/users.json');

var myRouter = Router();
myRouter.use(bodyParser.json())

const PORT = 3001;

let server = http.createServer(function (request, response) {
  myRouter(request, response), finalHandler(request, response)
}).listen(PORT);

myRouter.get('/products', (request, response) => {
  if(products.length == 0) {
    response.writeHead(404, 'No products found')
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(products));
  }
})