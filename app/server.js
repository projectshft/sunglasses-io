var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

let myRouter = Router()
myRouter.use(bodyParser.json())
const PORT = 3001;

let server = http.createServer(function (request, response){
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT)

myRouter.get('')
