var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const hostname = 'localhost';
const PORT = 3001;

//State holding variables
var brands = [];
var products = [];
var users = [];
var user = {};

//Router set up
var myRouter = Router();
myRouter.use(bodyParser.json());


const server = module.exports = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  //load data from files into server memory
  brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));
  // users = JSON.parse(fs.readFileSync('../initial-data/users.json', 'utf-8'));
  // user = users[0];
});
//return brands of sunglasses
myRouter.get('/api/brands', function(request, response){
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(brands));
});


myRouter.get('/api/brands/:id/products', function(request, response){
  // brand id retrieved from params
  const { id } = request.params;
  let productsByBrand = [];
  productsByBrand = products.filter(product => product.categoryId === id);
  if(productsByBrand.length === 0){
   response.writeHead(404, 'Brand not found');
   return response.end();
  } else {
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(productsByBrand));
  }
});
//return products by search
myRouter.get('/api/products', function(request, response){
  let searchString = request._parsedUrl.query.toLowerCase();
  let queryObject = queryString.parse(searchString);
  let searchResults = [];
  searchResults = products.filter(product => {
    let productName = product.name.toLowerCase();
    return productName.includes(queryObject.query);
  });
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(searchResults));
});