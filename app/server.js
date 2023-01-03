const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const Products = require('./models/products')
const Users = require('./models/users');
const Tokens = require('./models/access-token')

const PORT = 3001;

// API key giving use of server
// Created with https://www.uuidgenerator.net/
const VALID_API_KEYS = ["e347a542-b8dc-49a7-a5c5-aa6c889b1826","ae77856f-3796-4fa9-836e-b80beb50ae5e"]

// Setup router
var myRouter = Router();

//makes it so router uses middleware bodyParser to parse body to json
myRouter.use(bodyParser.json());

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
    Users.addUsers(parsedUsers);
  })
});

//GET list of all brands at the store
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

//Gets products by brand name
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
  const foundProduct = Products.getProductById(request.params.id);
  //if product not found return 404
  if(!foundProduct) {
    response.writeHead(404);
    return response.end("Product not found");
  }
  // Return product object
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(foundProduct));
})

//LOG IN user, checks for access tokens by user, creates new access token if expired or null
myRouter
.get("/api/user/login", (request, response) => {
  //parse url
  const parsedUrl = require("url").parse(request.url,true)
  const {email, password} = parsedUrl.query

  if(email && password){
    const user = Users.authenticateUser(email,password);
    if(user){
      //since user authenticated return will be succesful at this point and response will be json
      response.writeHead(200, {"Content-Type": "application/json"});
      Users.addCart(user);
      //Look for access token and if not found new one is made
      const currentAccessToken = Tokens.findCurrent(user);
      //if currentAccessToken is not found
      if(!currentAccessToken){
        const newAccessToken = Tokens.createToken(user);
        Tokens.pushNewTokenToAccessTokens(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
      return response.end(currentAccessToken.token);
    }else{
      response.writeHead(401,"Invalid username or password")
      return response.end();
    }
  }else{
    response.writeHead(400,"Submit username AND password")
    return response.end();
  }
})

// GET current user's whole cart
myRouter
.get("/api/user/cart", (request,response) => {
  let currentAccessToken = Tokens.getValidTokenFromRequest(request);
  //if user not logged in
  if(!currentAccessToken) {
    response.writeHead(401, "Log in to view cart");
    return response.end();
  } else {
    //retrieve cart and return it
    response.writeHead(200,{"Content-Type": "application/json"});
    response.end(JSON.stringify(Users.getUserCart()))
  }
})

//POST product by productID to the current user's cart 
myRouter
.post("/api/user/cart/:productId", (request,response) => {
  let currentAccessToken = Tokens.getValidTokenFromRequest(request);
  //if user not logged in
  if(!currentAccessToken) {
    response.writeHead(401, "Log-in to view cart");
    return response.end();
  } else {
    response.writeHead(200,{"Content-Type": "application/json"});
    let product = Products.getProductById(request.params.productId);
    //**** Ideally change it so that it's adding into the user object's cart... ***
    if(product){
      Users.addToUserCart(product, currentAccessToken);
      return response.end(JSON.stringify(Users.getUserCart()));
    }
    response.writeHead(400, "Product not found");
    return response.end();
  }
})

//DELETE product by productId in the cart
myRouter
.delete("/api/user/cart/:productId", (request,response) => {
  let currentAccessToken = Tokens.getValidTokenFromRequest(request);
  //if user not logged in
  if(!currentAccessToken) {
    response.writeHead(401, "Log in to view cart");
    return response.end();
  } else {
    const editedCart = Users.deleteFromUserCart(request.params.productId, currentAccessToken);
    //if cart was edited then success
    if(editedCart){
      response.writeHead(200,{"Content-Type": "application/json"});
      return response.end(JSON.stringify(Users.getUserCart()));
    } else {
      response.writeHead(400, "Item not present to delete");
      return response.end();
    }
    
  }
})

module.exports = server;