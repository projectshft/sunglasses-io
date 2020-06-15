var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser  = require('body-parser');
var uid = require('rand-token').uid;

const Brand = require('./app/models/brand')

const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);


myRouter.get('/brand', function(request,response) {
// Return all books in the db
response.writeHead(200, { "Content-Type": "application/json" });
return response.end(JSON.stringify(Brand.getAll()));
});

module.exports = server;