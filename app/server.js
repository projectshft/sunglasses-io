var http = require('http');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var Brand = require('./models/brands');
var Product = require('./modles/products');
//Need other Models-------

var uid = require('rand-token').uid;

var myRouter = Router();
myRouter.use(bodyParser.json());

let server = httpcreateServer(function(request, response) {
  myRouter(request, response,
  finalHandler(request,response))
}).listen(8080);

//EndPoint handlers
//Get Put Post Delete Edit


module.exports = server;