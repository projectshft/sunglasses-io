var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const url = require("url");

// State holding variables
let products = [];
// let user = {};
let brands = [];
let users = [];

const PORT = 3001;

// Set up router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  //populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  
  // hardcode "logged in" user
  // user = users[0];
});


// endpoint handlers: router.get, router.post

// GET ALL BRANDS
router.get("/api/brands", (request, response) => {
  let brandsToReturn = brands;
  if (brandsToReturn.length === 0) {
    response.writeHead(404, "No brands found");
    return response.end();
  } 
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
});

// GET ALL PRODUCTS
router.get("/api/products", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

module.exports = server;