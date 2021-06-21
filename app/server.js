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
var getNumOfFailedLoginRequestsForUsername = function (username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
};

var setNumOfFailedLoginRequestsForUsername = function (username, numFails) {
  failedLoginAttempts[username] = numFails;
};

var getValidTokenFromRequest = function (request) {
  var parsedUrl = require("url").parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure its valid and not expired
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

// Routes
router.get("/api/brands", (request, response) => {
  // Return all brands
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(Sunglasses.getBrands()));
});

router.get("/api/brands/:id/products", (request, response) => {
  console.log(request.params.id);
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
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brandProducts));
  }
});

router.get("/api/products", (request, response) => {
  // Return all products
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(Sunglasses.getProducts()));
});

router.post("/login", (request, response) => {
  // Make sure there is a username and password in the request
  const { username, password } = request.body;
  if (
    username &&
    password &&
    getNumOfFailedLoginRequestsForUsername(username) < 3
  ) {
    // See if there is a user that has that username and password
    let user = userData.find((user) => {
      user.login.username == username && user.login.password == password;
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
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

// router.get("/me/cart", (request, response) => {
//   // Fetch shopping cart
// });

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
