var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

let brands = [];
let products = [];
let users = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
    if (error) {
      return console.log('Error on Server Startup: ', error)
    }
    //Reads the brands.JSON file
    fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });
    //Reads the products.JSON file
    fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
      });
    
    console.log(`Server is listening on ${PORT}`);
  });

// Route to the brands. Should return all brands of sunglasses
myRouter.get('/api/brands', function(request,response){
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brands));
});
// Route to the products for a specific brand ID. Should return products offered for that brand
myRouter.get('/api/brands/:id/products', function(request,response){
    let productsWithBrandId = products.filter((product) => product.categoryId === request.params.id)

    if (productsWithBrandId.length === 0) {
		response.writeHead(404);	
		return response.end("Brand ID could not be found");
	}
    
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productsWithBrandId));
});

// Route to the products. Should return all products offered
myRouter.get('/api/products', function(request,response){
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(products));
});

module.exports = server;