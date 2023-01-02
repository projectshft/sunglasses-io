const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const Products = require('./models/products')
const Users = require('./models/users');

const PORT = 3001;

// API key giving use of server
// Created with https://www.uuidgenerator.net/
const VALID_API_KEYS = ["e347a542-b8dc-49a7-a5c5-aa6c889b1826","ae77856f-3796-4fa9-836e-b80beb50ae5e"]

// Setup router
var myRouter = Router();
//makes it so router uses middleware bodyParser to parse body to json
myRouter.use(bodyParser.json());

// variable value for 15 minutes
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

//creates web server object
let server = http.createServer(function (request, response) {
  if(!VALID_API_KEYS.includes(request.headers["x-authentication"])){
    response.writeHead(401,"You need to have a valid API key to use this API");
    return response.end();
  }
  
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

  fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    const parsedUsers = JSON.parse(data);
    Products.addUsers(parsedUsers);
  })
});

//return list of brands
myRouter
  .get("/api/brands", (request, response) => {
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
  .get("/api/brands/:brand/products", (request, response) => {
    const productsByBrand = JSON.stringify(Products.filterProductsByBrand(request.params.brand));
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
.get("/api/products", (request, response) => {
  const allProducts = JSON.stringify(Products.getAllProducts())
  
  if(!allProducts){
    response.writeHead(500, "Internal Server Error")
  }
  if(allProducts.length === 0){
    response.writeHead(404, "No products available")
  }
  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(allProducts);
})

//Returns product by id property
myRouter
.get("/api/products/:id", (request, response) => {
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

//Logs in user by creating an access token if password and username is valid
myRouter
.get("/api/login", (request, response) => {
  //parse url
  const parsedUrl = require("url").parse(request.url,true)
  const eMail = parsedUrl.query.email;
  const passWord = parsedUrl.query.password;
  if(eMail && passWord){
    const user = authenticatedUser(eMail,passWord);
    if(user){
      response.writeHead(200,{"Content-type: ": "application/json"});
      return response.end()
    }else{
      response.writeHead(401,"Invalid username or password")
      return response.end();
    }

  }else{
    response.writeHead(400,"Submit username AND password")
    return response.end();
  }
  
})

module.exports = server;