var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001; // Port for server to listen on

// State holding variables
let brands = [];
let products = [];
let users = [];

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Creates server
const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
})
.listen(PORT, error => {
  if (error) {
    // return console.log("Error on Server Startup: ", error);
  }
  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    // console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    // console.log(`Server setup: ${users.length} users loaded`);
  });
  // console.log(`Server is listening on ${PORT}`);
});

// GET /api/brands (Public)
myRouter.get("/api/brands", (request, response) => {
  response.writeHead(200, {"Content-Type": "application/json" });
  response.end(JSON.stringify(brands));
});

module.exports = server;