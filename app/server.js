const http = require('http');
const fs = require('fs');
// const url = require("url");
const finalHandler = require('finalhandler');
// var queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
// var uid = require('rand-token').uid;

//state holding variables
let brands = [];
let products = [];
let users = [];
let user = {};

const PORT = 3001;

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  router(request, response, finalHandler(request, response));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

 // populate brands  
  categories = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));

  // //populate products
  // goals = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  
  // //populate users
  // users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
  // // hard code "logged in" user
  // user = users[0];
});

router.get('/api/brands', function (request, response) {
  // Return all brands in the db 
  if (!brands) {
    response.writeHead(404, "There aren't any brands to return");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});
  
router.get('/api/products', function (request, response) {
  // Return all products in the db 
  if (!products) {
    response.writeHead(404, "There aren't any products to return");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

module.exports = server;
