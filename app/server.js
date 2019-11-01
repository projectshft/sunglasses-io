var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

//state holding variables 
var brands = [];
var products = [];
var users = {};

const PORT = 3001;

// Setup router
var myRouter = Router()
myRouter.use(bodyParser.json())

const server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
  }).listen(PORT, error => {
    if (error) {
      throw error
    }
  //populate dummy data
    brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8"));
    products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf8"));
    users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf8"));
    user = users[0];
  })

//get all brands
myRouter.get('/brands', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
});

//get all products by brand id
myRouter.get('/brands/id/products', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
});

myRouter.get('/products', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(products))
});


//export the server so that tests can be written
module.exports = server