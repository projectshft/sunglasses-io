const http = require("http");
const finalHandler = require("finalhandler");
const fs = require("fs");
var queryString = require("querystring");
const url = require("url");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;

const Sunglasses = require("./models");
const brandData = require("./initial-data/brands.json");
const productData = require("./initial-data/products.json");
const userData = require("./initial-data/users.json");

// State holding variables
let accessTokens = [];
let failedLoginAttempts = {};

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

// Setup Router
const router = Router();
router.use(bodyParser.json());

// Set Up Server
const server = http
  .createServer((request, response) => {
    router(request, response, finalHandler(request, response));
  })
  .listen(PORT, (err) => {});

// HELPER FUNCTIONS
// Helpers to get/set our number of failed requests per username
const getNumOfFailedLoginRequestsForUsername = function (username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
};

const setNumOfFailedLoginRequestsForUsername = function (username, numFails) {
  failedLoginAttempts[username] = numFails;
};

// Helper method to process access token
const getValidTokenFromRequest = function (request) {
  const token = request.headers["access-token"];
  if (token) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == token &&
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

// ROUTES
// Return all brands
router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  const getBrands = Sunglasses.getBrands();
  return response.end(JSON.stringify(getBrands));
});

// Return all products in a brand
router.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const brandId = brandData.find((brand) => brand.id == id);

  if (!brandId) {
    response.writeHead(404);
    return response.end("Brand Not Found");
  } else {
    const getBrandProducts = Sunglasses.getBrandProducts(id);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(getBrandProducts));
  }
});

// Return all products related to query
router.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const query = parsedUrl.query.q;

  if (query.length === 0) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(Sunglasses.getAllProducts()));
  } else {
    let queryResults = Sunglasses.getProducts(query);
    if (queryResults.length > 0) {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(queryResults));
    } else {
      response.writeHead(404);
      return response.end("No Products Found");
    }
  }
});

// Handle user login
router.post("/api/login", (request, response) => {
  // Make sure there is a username and password in the request
  let { username, password } = request.body;
  if (!username || !password) {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400);
    return response.end("Incorrectly formatted response");
  }

  if (
    username &&
    password &&
    getNumOfFailedLoginRequestsForUsername(username) < 3
  ) {
    // See if there is a user that has that username and password
    let user = userData.find((user) => {
      return user.login.username == username && user.login.password == password;
    });

    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumOfFailedLoginRequestsForUsername(username, 0);

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == username;
      });

      // Update the latest updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: username,
          lastUpdated: new Date(),
          token: uid(16),
        };
        accessTokens.push(newAccessToken);
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // Update the number of failed login attempts
      let numFailedAttemptsForUser =
        getNumOfFailedLoginRequestsForUsername(username);
      setNumOfFailedLoginRequestsForUsername(
        username,
        ++numFailedAttemptsForUser
      );

      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401);
      return response.end("Invalid username or password");
    }
  } else {
    if (getNumOfFailedLoginRequestsForUsername(username) >= 3) {
      response.writeHead(401);
      return response.end("Too many failed attempts");
    }
  }
});

// Initialize cart
router.get("/api/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "Authentication error");
    return response.end("Please log in again");
  } else {
    let { username } = currentAccessToken;
    let cart = Sunglasses.getCart(username);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(cart));
  }
});

router.post("/api/me/cart", (request, response) => {
  // Add items to cart
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "Authentication error");
    return response.end("Please log in again");
  } else {
    const username = currentAccessToken.username;
    const userCart = userData.find((user) => {
      return user.login.username === username;
    }).cart;
    const productId = request.body.id;
    const product = productData.find((product) => {
      return product.id === productId;
    });
    if (!product) {
      response.writeHead(404);
      return response.end("Product Not Found");
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify(Sunglasses.addProduct(product, userCart))
      );
    }
  }
});

router.delete("/api/me/cart/:productId", (request, response) => {
  // remove items from cart
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "Authentication error");
    return response.end("Please log in again");
  } else {
    let username = currentAccessToken.username;
    let userCart = userData.find((user) => {
      return user.login.username === username;
    }).cart;
    const { productId } = request.params;
    if (!userCart.find((item) => item.id === productId)) {
      response.writeHead(404);
      return response.end("Product Not In Your Cart");
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify(Sunglasses.deleteProduct(productId, userCart))
      );
    }
  }
});

router.post("/api/me/cart/:productId", (request, response) => {
  // Update items in cart
  let currentAccessToken = getValidTokenFromRequest(request);
  let { quantity } = request.body;

  if (!currentAccessToken) {
    response.writeHead(401, "Authentication error");
    return response.end("Please log in again");
  } else {
    let username = currentAccessToken.username;
    let userCart = userData.find((user) => {
      return user.login.username === username;
    }).cart;
    const { productId } = request.params;
    if (!userCart.find((item) => item.id === productId)) {
      response.writeHead(404);
      return response.end("Product Not In Cart");
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify(Sunglasses.updateProduct(productId, quantity, userCart))
      );
    }
  }
});

module.exports = server;
