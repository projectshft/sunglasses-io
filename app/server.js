var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
let Brand = require('./models/brands');

const PORT = 3001;

let products = [];
let users = [];

var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on server startup: ", error);
  }
  
  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
  })
  
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
  })
});

myRouter.get('/v1/products', (request, response) => {
  return;
})

myRouter.get('/v1/brands', (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  const brands = Brand.getAll();
  return response.end(JSON.stringify(brands));
})

myRouter.get('/v1/brands/:brandId/products', (request, response) => {
  response.writeHead(404, "no brand with that id found");
  return response.end();
})

myRouter.post('/v1/login', (request, response) => {
  return;
})

myRouter.get('/v1/me/cart', (request, response) => {
  return;
})

myRouter.post('/v1/me/cart', (request, response) => {
  return;
})

myRouter.post('/v1/me/cart/:cartProductId', (request, response) => {
  return;
})

myRouter.delete('/v1/me/cart/:cartProductId', (request, response) => {
  return;
})

module.exports = server;