var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
const url = require("url");
var Router = require("router");
var bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const PORT = 8080;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let brands = [];
let products = [];
let users = [];
var failedLoginAttempts = {};
let accessTokens = [];
let cart = [];

let server = http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }
    // set up our brands in state
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });

    // set up our products in state
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });

    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
  });

myRouter.get("/api/brands", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get("/api/brands/:id/products", function (request, response) {
  // need to figure out all our possible IDs to test param
  const brandIds = brands.reduce((idsArray, currentBrand) => {
    idsArray.push(currentBrand.id);
    return idsArray;
  }, []);
  // if the param id doesn't fit, return a 404
  if (!brandIds.includes(request.params.id)) {
    response.writeHead(404, "Invalid brand ID supplied");
    response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });

  let productsFilteredByBrand = products.filter((product) => {
    return product.categoryId === request.params.id;
  });

  return response.end(JSON.stringify(productsFilteredByBrand));
});

myRouter.get("/api/products", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });

  // Get our query params from the query string
  const queryParams = queryString.parse(url.parse(request.url).query);

  let currentProducts;

  // Look if there is a query param called search
  if (queryParams.search) {
    // grab the query that was passed
    const queryValue = new RegExp(queryParams.search, "gi");

    // return only those products which include the query value
    // in their description
    currentProducts = products.filter((product) => {
      if (queryValue.test(product.description) || queryValue.test(product.name)) {
        return product;
      }
    });
  } else {
    // we don't want to change state, and copying the whole in case no query term passed
    currentProducts = products.slice();
  }
  return response.end(JSON.stringify(currentProducts));
});

// Helpers to get/set our number of failed requests per username
var getNumberOfFailedLoginRequestsForUsername = function (username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
};

var setNumberOfFailedLoginRequestsForUsername = function (username, numFails) {
  failedLoginAttempts[username] = numFails;
};

myRouter.post("/api/login", function (request, response) {
  if (
    request.body.username &&
    request.body.password &&
    getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3
  ) {
    // see if the user exists
    const user = users.find((user) => {
      return user.login.username === request.body.username && user.login.password === request.body.password;
    });

    // kick them out early
    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumberOfFailedLoginRequestsForUsername(request.body.username, 0);
      response.writeHead(200, { "Content-Type": "application/json" });

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uuidv4(),
        };
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // Update the number of failed login attempts
      let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
      setNumberOfFailedLoginRequestsForUsername(request.body.username, ++numFailedForUser);

      // response for brute force attack because I'd like to use error 418
      if (getNumberOfFailedLoginRequestsForUsername(request.body.username) >= 3) {
        response.writeHead(418, "Too many login attempts.");
      } else {
        response.writeHead(401, "Invalid username or password");
      }

      return response.end();
    }
  } else {
    // response for incorrect data
    response.writeHead(400, "Incorrectly formatted request");
    return response.end();
  }
});

// Helper method to process access token
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

myRouter.post("/api/me/cart", function (request, response) {
  // we'll need to check if they are logged in
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    const queryParams = queryString.parse(url.parse(request.url).query);

    if (queryParams.product) {
      let productId = "product_" + queryParams.product;

      // we need to find the right product
      const productObj = products.find((product) => {
        return product.id === queryParams.product;
      });

      // and then transform it to a useful form
      const productToAdd = {
        [productId]: {
          name: productObj.name,
          quantity: 1,
          price: productObj.price,
          categoryId: productObj.categoryId,
        },
      };

      cart.push(productToAdd);
    }

    return response.end(JSON.stringify(cart));
  }
});

module.exports = server;
