const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const url = require("url");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;
const { report } = require("process");

const PORT = 3001;

// State holding variables
let products = [];
let user = {};
let users = [];
let brands = [];
const newAccessToken = uid(16);
let accessTokens = [];

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

const VALID_API_KEYS = [
  "88312679-04c9-4351-85ce-3ed75293b449",
  "1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept, X-Authentication",
};

//setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  //preflight
  if (request.method === "OPTIONS") {
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }

  response.writeHead(200);
  myRouter(request, response, finalHandler(request, response));
});

server.listen(PORT, (error) => {
  if (error) {
    return console.log("Error on server startup:.", error);
  }
  //load data onto server
  products = JSON.parse(
    fs.readFileSync("./initial-data/products.json", "utf-8")
  );
  //load all users
  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));
  //current user will be user[0] initially
  user = users[0];
  //load all categories
  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));

  console.log("Server is running.");
  console.log(`${products.length} sunglasses loaded.`);
  console.log(`${users.length} users loaded.`);
  console.log(`${brands.length} brands loaded.`);
});

//login
myRouter.post("/api/login", (request, response) => {
  // username and password in request
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password
    let user = users.find((user) => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });

      // check for existing token
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16),
        };
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

// Helper method to process access token
const getValidTokenFromRequest = function (request) {
  const parsedUrl = require("url").parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == parsedUrl.query.accessToken &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
    });

    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

//sunglasses
myRouter.get("/", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });

  return response.end(JSON.stringify(products));
});

myRouter.get("/api/products", function (request, response) {
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

//brands
myRouter.get("/api/brands", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get("/api/brands/:categoryId/products", function (request, response) {
  let brandProducts = [];

  let brandProduct = products.filter((p) => {
    return p.categoryId === request.params.categoryId;
  });

  if (brandProduct !== undefined) {
    brandProducts.push(brandProduct);
  }

  if (brandProducts.length === 0) {
    response.writeHead(404, "No sunglasses brand found.");
    response.end();
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brandProducts));
  }
});

//user
myRouter.get("/api/me/cart", function (request, response) {
  if (!user) {
    response.writeHead(404, "No user found.");
    response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

myRouter.post("/api/me/cart", function (request, response) {
  let product = request.body;

  if (!product.price) {
    response.writeHead(400);
    return response.end("Product has no price.");
  }

  user.cart.push(product);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

myRouter.post("/api/me/cart/:productId", function (request, response) {
  let product = products.find((p) => {
    return p.id === request.params.productId;
  });

  if (!product) {
    response.writeHead(400, "No product Id found.");
    return response.end("No sunglasses with that Id found.");
  }

  //if product
  user.cart.push(product);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

myRouter.delete("/api/me/cart/:productId", function (request, response) {
  let cart = user.cart;

  let productToRemove = cart.findIndex(
    (product) => product.id === request.params.productId
  );

  cart.splice(productToRemove, 1);

  if (productToRemove === -1) {
    response.writeHead(400, "No product Id found.");
    return response.end("No sunglasses with that Id found in your cart.");
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cart));
});

module.exports = server;
