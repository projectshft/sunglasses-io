var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);


