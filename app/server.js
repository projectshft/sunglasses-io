const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;

const Sunglasses = require("./models/sunglasses-io");
const brandData = require("./initial-data/brands.json");
const productData = require("./initial-data/products.json");
const userData = require("./initial-data/users.json");

// State holding variables
let accessTokens = [];
let failedLoginAttempts = {};

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Setup Router
const router = Router();
router.use(bodyParser.json());

// Set Up Server
const server = http
  .createServer((request, response) => {
    router(request, response, finalHandler(request, response));
  })
  .listen(PORT);

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
    console.log("currentAccessToken", currentAccessToken);
    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// Routes
router.get("/api/brands", (request, response) => {
  // Return all brands
  response.writeHead(200, { "Content-Type": "application/json" });
  const getBrands = Sunglasses.getBrands();
  return response.end(JSON.stringify(getBrands));
});

router.get("/api/brands/:id/products", (request, response) => {
  // Return all products in a brand
  const { id } = request.params;
  const brandId = brandData.find((brand) => brand.id == id);

  if (!brandId) {
    response.writeHead(404);
    return response.end("Brand Not Found");
  } else {
    const brandProducts = productData.filter(
      (product) => product.categoryId == id
    );
    const getBrandProducts = Sunglasses.getBrandProducts(brandProducts);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(getBrandProducts));
  }
});

router.get("/api/products", (request, response) => {
  // Return all products
  response.writeHead(200, { "Content-Type": "application/json" });
  const getProducts = Sunglasses.getProducts();
  return response.end(JSON.stringify(getProducts));

  // NEED TO ADD QUERY PARAMS TO THIS?
});

router.post("/api/login", (request, response) => {
  // Make sure there is a username and password in the request
  let { username, password } = request.body;

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

      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, { "Content-Type": "application/json" });

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == username;
      });
      // Update the latest updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: username,
          lastUpdated: new Date(),
          token: uid(16),
        };
        accessTokens.push(newAccessToken);
        console.log("accesstokens", accessTokens);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.setHeader("accessToken", newAccessToken.token);
        // return response.end();
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
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

router.get("/api/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  console.log(currentAccessToken);

  if (!currentAccessToken) {
    response.writeHead(401, "Authentication error");
    return response.end("Please log in again");
  } else {
    let currentUsername = currentAccessToken.username;
    let user = userData.find((user) => user.login.username == currentUsername);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

// router.post("/me/cart", (request, response) => {
//   // Create cart
// });

// router.delete("/me/cart/:productId", (request, response) => {
//   // Delete item from cart
// });

// router.post("/me/cart/:productId", (request, response) => {
//   // Add item to cart
// });

module.exports = server;
