var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const Brands = require('./models/brands-model');

const PORT = 3001;

//setup the router
var myRouter = Router();
myRouter.use(bodyParser.json());

//assign server to a variable for export
let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))

}).listen(PORT);

//Handle get request for all brands (to fill the html element with brand names)
myRouter.get('/api/brands', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json"} );
  return response.end(JSON.stringify(Brands.getAllBrands()));
})


module.exports = server;