const http = require('http');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const fs = require('fs');

const Brands = require('./models/brands');
const Products = require('./models/products');
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
  //data from files
  //Brands
  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
//products
  products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));
//all users
  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));
});

myRouter.get('/brand', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Brands.getAll()));
});

myRouter.get('/products', function(request, response) {
  response.writeHead(200, {"Content-type": "application/json"});
  return response.end(JSON.stringify(Products.getAll()));
})


module.exports = server;