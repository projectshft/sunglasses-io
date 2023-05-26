var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
const express = require("express");
const { use } = require("chai");
var uid = require("rand-token").uid;

module.exports = app;

const PORT = 3002;

// Read the JSON file
//const jsonData = fs.readFileSync("data.json", "utf-8");
//const jsonData = fs.readFileSync(path.join(__dirname, '..', 'data.json'), 'utf-8');
const jsonData = fs.readFileSync(__dirname + "/../data.json", "utf-8");

//varibles
const sunglassesData = JSON.parse(jsonData).sunglasses;
const cart = [];
let storeUsers = JSON.parse(jsonData).users;
let accessTokens = [];

//set up router
const app = express();
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

// Helper method to process access token
//I had trouble with the authentication this part is not working
function getValidTokenFromRequest(request) {
  if (request.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == request.query.accessToken &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
    });
    if (currentAccessToken) {
      console.log("currentaccesstoken :", currentAccessToken);
      return currentAccessToken;
    } else {
      console.log("innernull");
      return null;
    }
  } else {
    console.log("outernull");
    return null;
  }
}

//POST login
app.post("/sunglasses/login", function (request, response) {
  if (request.body.username && request.body.password) {
    let user = storeUsers.find((login) => {
      return (
        login.username == request.body.username &&
        login.password == request.body.password
      );
    });
    if (user) {
      let newAccessToken = {
        username: request.body.username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      //console.log(newAccessToken);
      accessTokens.push(newAccessToken);
      response.status(200);
      return response.end(JSON.stringify(newAccessToken.token));
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

// Shopping cart - Show cart - GET /api/me/cart
app.post("/sunglasses/me/cart", function (request, response) {
  // Check if user is logged in (authenticated)
  let currentAccessToken = accessTokens[0].token;
  if (!currentAccessToken) {
    response.status(401, "You need access to see the cart");
    return response.end();
  } else {
    return response.status(200, cart);
  }
});

// shoping cart - add items - POST /api/me/cart
app.post("/sunglasses/me/cart/add", function (request, response) {
  //let currentAccessToken = getValidTokenFromRequest(accessTokens);
  //   if (accessTokens) {
  //     console.log(accessTokens);
  const thisItemId = request.body.itemId;

  const item = sunglassesData.find((item) => {
    return item.itemId === thisItemId;
  });
  if (!item) {
    response.status(404).send("The sunglasses with this id is not found1");
  } else {
    let newCartItem = {
      brand: item.brand,
      name: item.name,
      price: item.price,
      quantityAdded: 1,
    };
    cart.push(newCartItem);
    // Return a response indicating the item was successfully added to the cart
    response.status(201).send("Item added to the cart");
  }
  //   } else {
  //     response.status(401, "You need access to add items to cart");
  //     return response.end();
  //   }
});

// shopping cart - delete items - DELETE /api/me/cart/:productId
app.delete("/sunglasses/me/cart/delete", function (request, response) {
  const thisItemId = request.body.itemId;
  const item = cart.find((item) => {
    return item.itemId === thisItemId;
  });

  if (!item) {
    response.status(404).send("This sunglasses is not in the cart");
  } else {
    cart.pop(item);
    response.status(201).send("Item deleted from cart");
  }
});

// shopping cart - change quanity - POST /api/me/cart/:productId
//ex. {"itemId": "2", "action":"increase""}
app.put("/sunglasses/me/cart/change/:productId", function (request, response) {
  const thisItemId = request.params.itemId;
  const item = cart.find((item) => {
    item.itemId === thisItemId;
  });

  const action = request.body.action;

  if (!item) {
    return response.end(400, "This sunglasses is not in the cart");
  } else if (action === "increase" || action === "decrese") {
    if (action === "increase") {
      item.quantityAdded += 1;
    } else if (action === "decrease" && item.quantityAdded > 0) {
      item.quantityAdded -= 1;
    }
    response.status(201).send("quantity changed");
  } else {
    response.status(400).json({ error: 'Bad Request' });
  }
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
