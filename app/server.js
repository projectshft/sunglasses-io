var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const brandsJson = require('./../initial-data/brands.json')

const PORT = 8080;

let server = http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT);

const myRouter = Router();

// this works
myRouter.get("/brands", (request, response) => {
  // get code from books
  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsJson));
});

module.exports = server;
