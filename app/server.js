var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
const express = require("express");
const app = express();

module.exports = app;

const PORT = 3002;

// Read the JSON file
//const jsonData = fs.readFileSync("data.json", "utf-8");
//const jsonData = fs.readFileSync(path.join(__dirname, '..', 'data.json'), 'utf-8');
const jsonData = fs.readFileSync(__dirname + "/../data.json", "utf-8");

const VALID_API_KEYS = [
  "88312679-04c9-4351-85ce-3ed75293b449",
  "1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7",
];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

//varibles
const sunglassesData = JSON.parse(jsonData).sunglasses;
const cart = [];
let storeUsers = JSON.parse(jsonData).users;
let accessTokens = [];
let failLoginAttempts = {};

//set up router
var myRouter = Router();
app.use(bodyParser.json());

app.get("/", function (request, response) {
  response.end("Welcome to the sunglasses store!");
});

//working
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

//working
// individual product and its info - GET /api/brands/:id/products
app.get("/sunglasses/brand/:itemId", function (request, response) {
  //look up the item, if it doesnt exist, return 404
  const thisItemId = request.params.itemId;
  const item = sunglassesData.find((g) => g.itemId === thisItemId);
  if (!item) {
    response.status(404).send("The sunglasses with this id is not found");
  } else {
    response.setHeader("Content-Type", "application/json");
    return response.end(JSON.stringify(item));
  }
});

//creat login - POST /api/login
// app.post("/sunglasses/login", function (request, response) {
//   const creatLogin = {
//     username: request.body.username,
//     password: request.body.password,
//     email: request.body.email,
//     first_name: request.body.first_name,
//     last_name: request.body.last_name,
//     userId: (sunglassesData.user.length += 1),
//   };
// });

// shoping cart - show cart - GET /api/me/cart
//authentification needed to see cart

// POST /api/login

//POST login
app.post("/sunglasses/login", function (request, response) {
  if (request.username && request.password) {
    const { username, password } = request.body;
    console.log(username, password);
    storeUsers.push({ username, password });
  }
});

//   // Check if the username and password are provided
//   if (username && password) {
//     let user = users.find((user) => {
//       console.log(user);
//       return user.username === username && user.password === password;
//     });

//     if (user) {
//       // how to? Generate a new access token
//       let newAccessToken = {
//         username: user.username,
//         lastUpdated: new Date(),
//         token: uid(16),
//       };
//       accessTokens.push(newAccessToken);
//       console.log(newAccessToken);

//       // Return the access token as the response
//       response.status(200).json(newAccessToken);
//     } else {
//       response.status(401).send("Invalid username or password");
//     }
//   } else {
//     response.status(400).send("Incorrectly formatted request");
//   }


// Shopping cart - Show cart - GET /api/me/cart
app.get("/sunglasses/me/cart", function (request, response) {
  // Check if user is logged in (authenticated)
  if (isUserLoggedIn(request)) {
    response.status(200).json(cart);
  } else {
    response.status(401).send("Unauthorized access");
  }
});

//working
// shoping cart - add items - POST /api/me/cart
app.post("/sunglasses/me/cart/add", function (request, response) {
  //URL itemId
  const thisItemId = request.body.itemId;
  //console.log(thisItemId);

  const item = sunglassesData.find((item) => {
    return item.itemId === thisItemId;
  });

  if (!item) {
    response.status(404).send("The sunglasses with this id is not found1");
  } else {
    //console.log(item);
    cart.push(item);
    //console.log(cart);
    // Return a response indicating the item was successfully added to the cart
    response.status(201).send("Item added to the cart");
  }
});

//working
// shopping cart - delete items - DELETE /api/me/cart/:productId
app.delete("/sunglasses/me/cart/delete", function (request, response) {
  const thisItemId = request.body.itemId;
  const item = cart.find((item) => {
    return item.itemId === thisItemId;
  });

  if (!item) {
    response.status(404).send("This sunglasses is not in the cart");
  } else {
    console.log(item);
    cart.pop(item);
    response.status(201).send("Item deleted from cart");
  }
});

// shopping cart - change quanity - POST /api/me/cart/:productId
app.put("/sunglasses/me/cart/:productId/change", function (request, response) {
  const thisItemId = request.params.itemId;
  const item = cart.find((item) => {
    item.itemId === thisItemId;
  });
  if (!item) {
    return response.end("This sunglasses is not in the cart");
  } else {
  }
});

//create server
// http
//   .createServer(function (request, response) {
//     myRouter(request, response, finalHandler(request, response));
//   })

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
