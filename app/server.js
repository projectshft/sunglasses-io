var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var url = require("url");
var uid = require('rand-token').uid;

const PORT = 3001;
// State holding variables
let cart = [];
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

// Set up router
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile("../initial-data/brands.json", "utf-8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    // console.log(`Server setup: ${brands.length} brands loaded`);
  });

  fs.readFile("../initial-data/products.json", "utf-8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    // console.log(`Server setup: ${products.length} products loaded`);
  });

  fs.readFile("../initial-data/users.json", "utf-8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    // console.log(`Server setup: ${users.length} users loaded`);
  });

  console.log(`Server is listening on ${PORT}`);
});

myRouter.get("/brands", (request, response) => {
  // Return all the brands in the database
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get("/brands/:id/products", (request, response) => {
  const id = request.params.id;
  let brand = brands.find((brand => brand.id == id));

  // Return 404 if not found
  if (!brand) {
    response.writeHead(404);
    return response.end("Brand not found");
  }

  // Otherwise return array of products with brand
  let productsWithBrand = products.filter(product => product.categoryId == id);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsWithBrand));
});

myRouter.get("/products", (request, response) => {
  // Return all the products relevant to a search query
  const parsedUrl = url.parse(request.originalUrl);
  let { query } = queryString.parse(parsedUrl.query);
  query = query.toLowerCase();
  // return a 400 if query is too short
  if (query.length < 3) {
    response.writeHead(400, "Invalid search query. Query must contain more than 3 characters");
    response.end();
  } else {
    // otherwise return the relevant products
    let productsToReturn = products.filter((product) => {
      if (product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });
    // return a 404 if no search results are found
    if (!productsToReturn.length) {
      response.writeHead(404, "No products were found.");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "application/json" });
      response.end(JSON.stringify(productsToReturn));
    }
  }
});

module.exports = server;
