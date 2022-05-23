var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

let brands = [];
let products = [];
let users = [];

var myRouter = Router();
myRouter.use(bodyParser.json())

const PORT = 3001;

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
  
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile('initial-data/brands.json', 'utf8', (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  
  fs.readFile('initial-data/users.json', 'utf8', (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });

  fs.readFile('initial-data/products.json', 'utf8', (err, data) => {
    if (error) throw error;
    products = JSON.parse(data)
    console.log(`Server setup: ${products.length} products loaded`)
  })

  console.log(`Server is listening on ${PORT}`);
});;

// GET all products
myRouter.get('/api/products', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

// GET all brands
myRouter.get('/api/brands', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
})


module.exports = server;