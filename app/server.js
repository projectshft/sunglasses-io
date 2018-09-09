var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//create server and set it to listen to the port variable value
http.createServer(function (request, response) {
  if (request.url.includes('api')) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    myRouter(request, response, finalHandler(request, response))
  } else {
    serve(request, response, finalHandler(request, response))
  }
}).listen(PORT);