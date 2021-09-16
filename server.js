const http = require('http');
const finalHandler = require('finalhandler');
const Router = require('router');
const bodyParser = require('body-parser');
const Brand = require('./app/models/brand')

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(8080);

myRouter.get('/brands', function(request,response) {
	// Return all books in the db
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(Brand.getAll()));
});

myRouter.get('/brands/:brand', function(request, response) {
  // Get our query params from the query string.
  // Find brand to return
  const foundBrand = Brand.getBrand(request.params.brand)
  // Return 404 if not found
  if (!foundBrand) {
    response.writeHead(404);
    return response.end('Brand Not Found');
  }
  // Return brand information
  response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(foundBrand));
});


module.exports = server;