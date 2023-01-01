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

//fs read json data and use it for products class
server.listen(PORT, error => {
  //immediatly handle error
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }
  //read json files, error handle, parse data, add to module state
  fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    const parsedProducts = JSON.parse(data);
    Products.addProducts(parsedProducts);
  });

  fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    const parsedBrands = JSON.parse(data);
    Products.addBrands(parsedBrands);
  })
});

//return list of brands
myRouter
  .get("/v1/brands", (request, response) => {
    const allBrands = Products.getAllBrands()
    //if brands.json data is empty
    if(!allBrands){
      response.writeHead(500, "Internal Server Error")
    }
    if(allBrands.length === 0){
      response.writeHead(404, "No brands available")
    }
    
    response.writeHead(200, {"Content-Type": "application/json"});
    return response.end(JSON.stringify(allBrands));
  })

  //return list of products by brand
myRouter
  .get("/v1/brands/:brand", (request, response) => {
    const productsByBrand = JSON.stringify(Products.filterByBrand(request.params.brand));
    if(!productsByBrand){
      response.writeHead(400, "Invalid brand")
      return response.end();
    }
    if(productsByBrand.length === 0){
      response.writeHead(404, "Product under this brand not found")
      return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(productsByBrand)
  })

//Returns list of products
myRouter
.get("/v1/products", (request, response) => {
  const allProducts = JSON.stringify(Products.getAllProducts())
  
  if(!allProducts){
    response.writeHead(500, "Internal Server Error")
  }
  if(allProducts.length === 0){
    response.writeHead(404, "No products available")
  }
  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end();
})

//Returns product by id property
myRouter
.get("/v1/products/:id", (request, response) => {
  //find product
  const foundProduct = Products.getProductsById(request.params.id);
  //if product not found return 404
  if(!foundProduct) {
    response.writeHead(404);
    return response.end("Product not found");
  }
  // Return product object
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(foundProduct));
})

module.exports = server;