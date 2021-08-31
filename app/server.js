var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

let brands = [];
let products = [];
let users = [];

const PORT = 3001;

let myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));

  products = JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));

  users = JSON.parse(fs.readFileSync('../initial-data/users.json', 'utf-8'));
});

myRouter.get('/api/products', function(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:id/products', function(request, response) {
  const { id } = request.params.id;
  const selectedBrand = brands.find(brand => brand.id == id);
  
  if (!selectedBrand) {
    response.writeHead(404, "There are not products of this brand");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  
  const brandProducts = products.filter(
    product => product.brandId === id
  );
  return response.end(JSON.stringify(brandProducts));
});

module.exports = server;
