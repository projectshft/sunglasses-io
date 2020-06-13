var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const Brands = require('./models/brands-model');
const Products = require('./models/products-model');

const PORT = 3001;

//setup the router
var myRouter = Router();
myRouter.use(bodyParser.json());

//assign server to a variable for export
let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))

}).listen(PORT);

//Handle get request to return all available brands
myRouter.get('/api/brands', function(request,response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Brands.getAllBrands()));
})

//Handle get request to return all available products
myRouter.get('/api/products', function(request,response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Products.getAllProducts()));
})


//Handle get request to return all available products of a particular brand 
myRouter.get('/api/brands/:id/products', function(request, response) {
 
  //First get the brand from the brand id (query param)
  const selectedBrandId = request.params.id;
  
  //If brand id was not provided in the query, return error
  if (!selectedBrandId) {
    response.writeHead(400);
    return response.end("Unable to complete request")
  }

  // If there are no brands matching the brand Id from the query, return error
  // if (getProductsByBrandId(selectedBrandId).length == 0) {
  //   response.writeHead(404);
  //   return response.end("No products found");
  // }
  // Return the available products available for the particular brand id
  response.writeHead(200, {"Content-Type": "application/json"});

  return response.end(JSON.stringify(Products.getProductsByBrandId(selectedBrandId)))
})


module.exports = server;