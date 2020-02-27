var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
//used in goals worth to parse equery string for serch
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
    if (request.url.includes('api')) {
        response.writeHead(200, {'Content-Type': 'application/json'});
        myRouter(request, response, finalHandler(request, response))
      } else {
        // This call serves the webpage for the frontend rather than opening it directly
        serve(request,response, finalHandler(request,response))
      }
}).listen(PORT);
