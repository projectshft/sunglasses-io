var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
const url = require("url");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;
const { report } = require("process");

const PORT = 3001;

// State holding variables
let products = [];
let user = {};
let users = [];
let categories = [];

//setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  response.writeHead(200);
  myRouter(request, response, finalHandler(request, response));
});

server.listen(PORT, () => {
  console.log("Server is running.");
  //load data onto server
  products = JSON.parse(
    fs.readFileSync("./initial-data/products.json", "utf-8")
  );
  //load all users
  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));
  //current user will be user[0] initially
  user = users[0];
  //load all categories
  categories = JSON.parse(
    fs.readFileSync("./initial-data/brands.json", "utf-8")
  );
});

myRouter.get("/v1/sunglasses", function (request, response) {
  //query params from query string
  const queryParams = queryString.parse(url.parse(request.url).query);
  let productsToReturn = [];

  productsToReturn = products.filter((product) => {
    return product.description.includes(queryParams.query);
  });

  if (productsToReturn.length === 0) {
    response.writeHead(404, "No sunglasses found.");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});
