const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;

const sunData = require('../initial-data/products.json')

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

myRouter.get('/sunglasses', function(request, response) {
  // Return all sunglasses in the DB
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(sunData));
});

module.exports = server;