var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
// to parse request bodies
var bodyParser   = require('body-parser');
// to generate access tokens
var uid = require('rand-token').uid;
const url = require('url');

let brands = [];
let products = [];
let users = [];

const PORT = 3001;
// setup router
const myRouter = Router();
myRouter.use(bodyParser.json());
// create server and import data from files in the project
let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('./initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  }); 
  console.log(`Server is listening on ${PORT}`);
});

// create route for brands, will return an array of objects aka the brands
myRouter.get('/api/brands', function(request,response) {
  if (brands) {
    response.writeHead(200, { "Content-Type": "application/json" });
    // return the brands
    return response.end(JSON.stringify(brands));
  }
});

// create route to get products related to a certain brand
myRouter.get('/api/brands/:brandId/products', function(request, response) {
  //verify that the brandId exists and matches with an Id we have
  let brand = brands.find((brand) => {
    return brand.id == request.params.brandId
  })
  //if the brand does not exist, return an error
  if (!brand) {
    response.writeHead(404, "The brand ID is incorrect");
    response.end()
  }
  else {
    response.writeHead(200, { "Content-Type": "application/json" });
    let productsAssociatedWithThisBrand = products.filter((product) => {
      return product.categoryId === request.params.brandId
    })
    // return all of the products associated with the brand
    return response.end(JSON.stringify(productsAssociatedWithThisBrand))
  } 
});

// create route for products, utilizes a search query, if none is given returns all products
myRouter.get('/api/products', function(request,response) {
  // need to create some if statements for search query 
  if (products) {
    response.writeHead(200, { "Content-Type": "application/json" });
    // return the products
    return response.end(JSON.stringify(products));
  }
});

// create a route for user login
myRouter.post('/api/login', function(request,response) {
  
})



module.exports = server;

