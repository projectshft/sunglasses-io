// imports
var http = require("http");
var fs = require("fs");
const finalHandler = require("finalhandler");
const Router = require("router");
const bodyParser = require("body-parser");
const { request } = require("https");

// declare port variable
const PORT = 3001;

// State holding variables // will be populated below // in place of database
let brands = [];
let products = [];
let users = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer((request, response) => {
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Sever Startup: ", error);
  }

  // load products
  fs.readFile("./initial-data/products.json", "utf-8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  // confirm server is listening on port
  console.log(`Server is listening on ${PORT}`);
});

// route to API "home page"
myRouter.get("/", (request, response) => {
  response.end("There's nothing here, please visit /api/products");
});

// route to products
myRouter.get("/api/products", (request, response) => {
  response.end(JSON.stringify(products));
});