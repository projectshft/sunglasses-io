var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;

// State holding variables

let brands = [];
let products = [];
let user = {};

const PORT = 3001;
const VALID_API_KEYS = ["12345", "01234"]; // Not yet implemented
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

//Setup server
const server = http.createServer((request, response) => {
  response.writeHead(200);
  myRouter(request, response, finalHandler(request, response));
});

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  //populate brands
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
  // hardcode "logged in" user
  user = users[0];
});

// List of Brands
myRouter.get("/brands", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

// List of Brands' Products
myRouter.get("/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const brand = brands.find((brand) => brand.id == id);

  if (!brand) {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(JSON.stringify("That brand does not exist"));
  }
  const relatedProducts = brands.filter(
    (products) => products.categoryId == brand.id
  );
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(relatedProducts));
});

// List of Products
myRouter.get("/products", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

// Login POST
myRouter.post("/login", function (request, response) {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password
    let user = users.find((user) => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      // Write the header because we know we will be returning successful at this point and that the response will be json
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

// GET shopping cart

// POST shopping cart

// DELETE item from shopping cart

// POST item to shopping cart

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

module.exports = server;
