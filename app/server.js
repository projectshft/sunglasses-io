const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const Products = require('./models/products')


const PORT = 3001;

// Setup router
var myRouter = Router();
//makes it so router uses middleware bodyParser to parse body to json
myRouter.use(bodyParser.json());

// variable value for 15 minutes
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

//creates web server object
let server = http.createServer(function (request, response) {
  //final handler (have googled plenty of time and need someone to explain)
  myRouter(request, response, finalHandler(request,response));
})

server.listen(PORT);

myRouter
  .get("/v1/brands", (request, response) => {
    //return list of brands
    response.writeHead(200, {"Content-Type": "application/json"});
    return response.end(JSON.stringify(Products.getAllBrands()));
  })

myRouter
  .get("/v1/brands/:brand", (request, response) => {
    //return list of products by brand
    const productsByBrand = Products.filterByBrand(request.params.brand);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productsByBrand))
  })

myRouter
.get("/v1/products", (request, response) => {
  //Returns list of products
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(Products.getAllProducts()));
})

myRouter
.get("/v1/products/:id", (request, response) => {
  //find product
  const foundProduct = Products.getProductsById(request.params.id);
  //if product not found return 400
  if(!foundProduct) {
    response.writeHead(400);
    return response.end("Product Not Found");
  }
  // Return product object
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(foundProduct));
})

module.exports = server;