var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var uid = require('rand-token').uid;
var bodyParser = require('body-parser');
var url = require('url');

const PORT = 3001;

//initialize arrays to hold incoming data from the fs.readFile functions
var products = [];
var users = [];
var brands = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http
  .createServer(function(request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    brands = JSON.parse(fs.readFileSync('./initial-data/brands.json'));
    users = JSON.parse(fs.readFileSync('./initial-data/users.json'));
    products = JSON.parse(fs.readFileSync('./initial-data/products.json'));
  });

myRouter.get('/products', function(request, response) {
  //is there a query param?
  const myURL = request.url;
  const myQuery = url.parse(myURL).query;
  //if there is, return the relevant products
  if (myQuery) {
    //-------------add toUppercase if you have time----------------
    //user querystring to turn the query into an object
    const queryObject = queryString.parse(myQuery);
    //get the array for the products matching the query param
    const productsMatchingQuery = products.filter(index =>
      index.title.includes(queryObject.query)
    );
    //check if search returned no results
    if (productsMatchingQuery.length === 0) {
      response.writeHead(404, 'No products match the search.');
      response.end();
    }
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(productsMatchingQuery));
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(products));
});

myRouter.get('/brands', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(brands));
});

myRouter.get('/brands/:brandId/products', function(request, response) {
  //filter the products according to the brand argument
  const brandProductsByParam = products.filter(index => {
    return index.brandId === request.params.brandId;
  });

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(brandProductsByParam));
});

//export http.createserver().listen() for testing
module.exports = server;
