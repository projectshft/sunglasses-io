var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

// // State holding variables
// let brands = [];
// let user = {};
// let products = [];
// let users = [];

const PORT = 3001;

//setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  response.writeHead(200);
  router(request, response, finalHandler(request, response))
}).listen(PORT);

server.listen(PORT, error => {
  if (error) throw error;
  console.log(`server running on port ${PORT}`);
  
  //populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
});

//GET api/brands
router.get('/api/brands', (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8")));
});