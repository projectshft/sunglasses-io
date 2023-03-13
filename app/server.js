const http = require('http');
const finalHandler = require('finalhandler');
// const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const Brands = require('./models/brands')
//Need other Models-------

// const uid = require('rand-token').uid;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

// This function is a bit simpler...
let server = http.createServer(function (request, response) {
  	myRouter(request, response, finalHandler(request, response))
}).listen(8090);

myRouter.get('/brand', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Brands.getAll()));
});
//EndPoint handlers
//Get Put Post Delete Edit


module.exports = server;