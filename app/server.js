const http = require('http');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const fs = require('fs');

//Need other Models-------

// const uid = require('rand-token').uid;

//state variables
let brands = [];
let users = [];
let products = [];
let filteredProducts = []

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  	myRouter(request, response, finalHandler(request, response))
}).listen(8090, () => {
  console.log("Node is running on 8090")
//Brands
  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
//products
  products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));
//all users
  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));
  user = users[0];
});

//GET Brands
myRouter.get('/brands', function(request, response) {
  if(!brands) {
    response.writeHead(404, "Nothing to return");
  }
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
});
//GET Products
myRouter.get('/products', function(request, response) {
  if(!products) {
    response.writeHead(404, "Nothing to return");
  };
response.writeHead(200, {"Content-Type": "application/json"});
return response.end(JSON.stringify(products));
});
//Get Products with filtered by brand
myRouter.get('/brands/:brandId/products', function(request, response) {
  let myBrand = brands;
  let myProduct = products;
  let myId =request.params.brandId;
  if (myId > 5) {
    response.statusCode = 400
    return response.end("No goal with that id please choose 1 through 5")
  }
  let getProduct = function (brands, product, parameter) {
    let myParam = parameter.toString();
    product.forEach(prod => {
     let myBrand = brands.find(e =>
       e.id === prod.categoryId);
       if (myBrand.id === myParam) {
         products.push(myBrand.name)
         products.push(prod.name)
       }
   })
  }

  response.writeHead(200);
  getProduct(myBrand, myProduct, myId);
  return response.end();


})



module.exports = server;