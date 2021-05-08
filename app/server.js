var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
const url = require('url');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
let Brand = require('./models/brands');
let Product = require('./models/products');
let User = require('./models/users');

const PORT = 3001;
// let brands = [];
// let products = [];
// let users = [];

var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on server startup: ", error);
  }
  Product.addProducts(JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")));
  Brand.addBrands(JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8")));
  User.addUsers(JSON.parse(fs.readFileSync("initial-data/users.json", "utf8")));

});

myRouter.get('/v1/products', (request, response) => {
  
  response.writeHead(200, { "Content-Type": "application/json" });
  const { query } = queryString.parse(url.parse(request.url).query)
  if(query) {
    const productsMatchingQuery = Product.getAll().filter((product) => product.description.includes(query));
    return response.end(JSON.stringify(productsMatchingQuery));
  }
  return response.end(JSON.stringify(Product.getAll()));
})

myRouter.get('/v1/brands', (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  const brands = Brand.getAll();
  return response.end(JSON.stringify(brands));
})

myRouter.get('/v1/brands/:brandId/products', (request, response) => {
  const selectedBrand = Brand.getBrand(request.params.brandId);
  if(!selectedBrand) {
    response.writeHead(404, "no brand with that id found");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" })
  const productsForSelectedBrand = Product.getAll().filter((product) => product.categoryId == selectedBrand.id);
  return response.end(JSON.stringify(productsForSelectedBrand));
})

myRouter.post('/v1/login', (request, response) => {
  return response.end();
})

myRouter.get('/v1/me/cart', (request, response) => {
  return response.end();
})

myRouter.post('/v1/me/cart', (request, response) => {
  return response.end();
})

myRouter.post('/v1/me/cart/:cartProductId', (request, response) => {
  return response.end();
})

myRouter.delete('/v1/me/cart/:cartProductId', (request, response) => {
  return response.end();
})

module.exports = server;