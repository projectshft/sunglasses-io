var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");

const PORT = 3002;

// Read the JSON file
const jsonData = fs.readFileSync("data.json", "utf-8");

//varibles
const sunglassesData = JSON.parse(jsonData).sunglasses;
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
    console.log(`listening on ${PORT}`);
  });

myRouter.get("/", function (request, response) {
  response.end("Welcome to the sunglasses store!");
});

//public route - endpoint for 'search for my glasses' - GET /api/brands
myRouter.get("/sunglasses", function (request, response) {
  const searchGlasses = sunglassesData.map((sunglasses) => {
    return {
      name: sunglasses.name,
      brand: sunglasses.brand,
    };
  });
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(searchGlasses));
});

// individual product and its info - GET /api/brands/:id/products
//creat login? - POST /api/login
// shoping cart - show cart - GET /api/me/cart
// shoping cart - add items - POST /api/me/cart
// shopping cart - delete items - DELETE /api/me/cart/:productId
// shopping cart - change quanity - POST /api/me/cart/:productId
