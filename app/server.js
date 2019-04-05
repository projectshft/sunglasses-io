var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
// let failedLoginAttempts = {};
// const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const PORT = 3001;

// State holding variables
let brands = [];
let users = [];
let products = [];

// Create server
const server = http.createServer((request, response) => {

    myRouter(request, response, finalHandler(request, response));

})
.listen(PORT, error => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }
    fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile("initial-data/users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });
    fs.readFile("initial-data/products.json", "utf8", (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
  });

  myRouter.get('/api/brands', function(request, response) {
      console.log(brands)
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify(brands));

  });

  myRouter.get('/api/brands/:id/products', function(request, response) {
    console.log(products)
      // Verify that there are products under this brand before we should continue processing
      let filteredProducts = products.filter((product) => {
        return product.categoryId == request.params.id;
      });
      if (filteredProducts.length == 0) {
        // If there isn't a product under that brand, then return a 404
        response.writeHead(404, "Brand not found");
        response.end();
        return;
      } else {
            // Return the products from the store
              response.writeHead(200, {'Content-Type': 'application/json'});
              response.end(JSON.stringify(filteredProducts));
              return;          
      }
    });



module.exports = server;