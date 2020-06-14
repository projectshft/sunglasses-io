var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
const url = require("url");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;

const PORT = 8080;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let brands = [];
let products = [];

let server = http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }

    // set up our brands in state
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });

    // set up our products in state
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
  });

// Public route - all users of API can access
myRouter.get("/api/brands", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get("/api/products", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });

  // Get our query params from the query string
  const queryParams = queryString.parse(url.parse(request.url).query);

  let currentProducts;

  // Look if there is a query param called search
  if (queryParams.search) {
    // grab the query that was passed
    const queryValue = new RegExp(queryParams.search, "gi");

    // return only those products which include the query value
    // in their description
    currentProducts = products.filter((product) => {
      if (queryValue.test(product.description) || queryValue.test(product.name)) {
        return product;
      }
    });
  } else {
    // we don't want to change state, and copying the whole in case no query term passed
    currentProducts = products.slice();
  }
  return response.end(JSON.stringify(currentProducts));
});

module.exports = server;
