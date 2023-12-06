var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const PORT = 3001;
const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication" };


const myRouter = Router();
myRouter.use(bodyParser.json());

// State holding variables 
let brands = [];
let users = [];
let products = []

// Set up server
const server = http.createServer(function (request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }
  const requestToken = request.headers['x-authentication'];
  if (!validateToken(requestToken)) {
    response.writeHead(401, "Unauthorized ")
    return responseq.end();
  }
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, (error) => {
  if (error) {
    throw error
  }
  fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data)
  })
  fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data)
  })
  fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data)
  })
})

module.exports = server;