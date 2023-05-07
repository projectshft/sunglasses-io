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
//cart will probably need to be an empty array to post product/brand db info to;

//Setup for the router
let myRouter = Router();
myRouter.use(bodyParser.json());
//Setup for server
let server = http.createServer(function (request, response) {
  response.writeHead(200);
    myRouter(request, response, finalHandler(request, response))
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port port ${PORT}`);
  //populate brands
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  // console.log(brands);
  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  // console.log(products);

})
//GET all brands
myRouter.get("/api/brands", function(request,response) {

  if(!request) {
    return console.log('request not defined')
  }

  let brandsToReturn = [];
  brandsToReturn = brands;
  // console.log('brands to return', brandsToReturn);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
})

//GET all products of a single brand (by categoryId)

//GET all products
myRouter.get("/api/products", function(request,response) {

  if(!request) {
    return console.log('request not defined')
  }

  let productsToReturn = [];
  productsToReturn = products;
  console.log('products to return', productsToReturn);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
})

module.exports = server;
