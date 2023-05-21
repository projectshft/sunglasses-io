var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;
const yaml = require("js-yaml");

const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");

const PORT = 3002;
const baseUrl = "https://api.sunglasses.com/v1";

//varibles
let users = [];
let glasses = [];
let accessToken = [];
let failLoginAttempts = {};

//set up router
var myRouter = Router();
myRouter.use(bodyParser.json());

//create server
http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    // const store = JSON.parse(fs.readFileSync('swagger.yaml','us-ascii'))
    const swaggerFile = fs.readFileSync("app/swagger.yaml");
    const swaggerDocument = yaml.load(swaggerFile);
    console.log(`listening on ${PORT}`);
  });

myRouter.get("/", function (request, response) {
  response.end("Welcome to the sunglasses store!");
});

//public route - endpoint for 'search for my glasses' - GET /api/brands
app.get("/sunglasses", (req, res) => {
  const ked = "";
});

// individual product and its info - GET /api/brands/:id/products
//creat login? - POST /api/login
// shoping cart - show cart - GET /api/me/cart
// shoping cart - add items - POST /api/me/cart
// shopping cart - delete items - DELETE /api/me/cart/:productId
// shopping cart - change quanity - POST /api/me/cart/:productId
