var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
const express = require('express'); 
const app = express(); 


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
app.use(bodyParser.json());

app.get("/", function (request, response) {
  response.end("Welcome to the sunglasses store!");
});

//public route - endpoint for 'search for my glasses' - GET /api/brands
app.get("/sunglasses", function (request, response) {
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
app.get("/sunglasses/:itemId", function (request, response) {
    //look up the item, if it doesnt exist, return 404
    const thisItemId = request.params.itemId; 
    const item = sunglassesData.find(g => g.itemId === thisItemId); 
    if (!item) {
        response.status(404).send('The sunglasses with this id is not found')
    } else {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(item)); 
    }
  });
//creat login? - POST /api/login
// shoping cart - show cart - GET /api/me/cart
// shoping cart - add items - POST /api/me/cart
// shopping cart - delete items - DELETE /api/me/cart/:productId
// shopping cart - change quanity - POST /api/me/cart/:productId

//create server
// http
//   .createServer(function (request, response) {
//     myRouter(request, response, finalHandler(request, response));
//   })
app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });

