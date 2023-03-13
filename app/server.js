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


myRouter.get('/brands', function(request, response) {
  if(!brands) {
    response.writeHead(404, "Nothing to return");
  }
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
});

myRouter.get('/products', function(request, response) {
  if(!products) {
    response.writeHead(404, "Nothing to return");
  };
response.writeHead(200, {"Content-Type": "application/json"});
return response.end(JSON.stringify(products));
});

myRouter.get('/brands/:brandId', function(request, response) {
  let brand = brands.find((b) => {
    return b.id == request.params.brandId
  });
})



module.exports = server;