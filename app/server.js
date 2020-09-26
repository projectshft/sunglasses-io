var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
// to parse request bodies
var bodyParser   = require('body-parser');
// to generate access tokens
var uid = require('rand-token').uid;
// variables
let brands = [];
let products = [];
let users = [];

const PORT = 3001;
// setup router
const myRouter = Router();
myRouter.use(bodyParser.json());
// create server and import data from files in the project
let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('./initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  }); 
  console.log(`Server is listening on ${PORT}`);
});

// create route for brands, will return an array of objects aka the brands
myRouter.get('/api/brands', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  // return the brands
  return response.end(JSON.stringify(brands));
});


module.exports = server;

