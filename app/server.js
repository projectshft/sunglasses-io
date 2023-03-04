var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// Define local state variables to store data (in place of database)
let brands = [];
let products = [];
let users = [];


// Setup Router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Setup Server
const server = http.createServer(function (request, response) {
  
  // --- Logic for CORS Preflight and Verify API key here ---
  
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (!error) {
    console.log(`Server running on ${PORT}`)
  } else {
    return console.log("Error on Server Startup: ", error);
  }

  // Load in Brands data
  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });

  // Load in Products data
  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });

  // Load in Users data
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });

});

// Define Routes
myRouter.get("/", (request, response) => {
  response.end("This is the root endpoint, nothing to see here.");
});

// GET Brands
myRouter.get('/api/brands', (request, response) => {
  if (brands.length === 0) {
    response.writeHead(404, "No brands found");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(brands));
  }
});

// GET Products by Brand
myRouter.get('/api/brands/:id/products', (request, response) => {
  // Get brand by id
  let brand = brands.find((brand) => {
    return brand.id === request.params.id
  })
  // Return only products whose id matches id in params
  let productsByBrand = products.filter(p => p.categoryId === brand.id);
  if (productsByBrand.length === 0) {
    response.writeHead(404, "No products found");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(productsByBrand));
  }
});






module.exports = server;