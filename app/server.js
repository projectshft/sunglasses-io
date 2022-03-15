// imports
var http = require("http");
var fs = require("fs");
const finalHandler = require("finalhandler");
const Router = require("router");
const bodyParser = require("body-parser");
const { request } = require("https");
const { Module } = require("module");

// declare port variable
const PORT = 3001;

// State holding variables // will be populated below // in place of database
let brands = [];
let products = [];
let users = [];
let cart = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json()); 

const server = http.createServer((request, response) => {
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Sever Startup: ", error);
  }

  // load products
  fs.readFile("./initial-data/products.json", "utf-8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });

  // load brands
  fs.readFile("./initial-data/brands.json", "utf-8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
 
  // load users
  fs.readFile("./initial-data/users.json", "utf-8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  // confirm server is listening on port
  console.log(`Server is listening on ${PORT}`);
});

// route to API "home page"
myRouter.get("/", (request, response) => {
  response.end("There's nothing here, please visit /api/products");
});

// Public route to products
myRouter.get("/api/products", (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

// Public route to brands
myRouter.get("/api/brands", (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// Public route to brands
myRouter.get("/api/users", (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(users));
});

// Public route to specific products by brand
myRouter.get("/api/products/:brandId", (request, response) => {
  const { brandId } = request.params; 
  const productsByBrand = products.filter(product => product.categoryId === brandId); 

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(productsByBrand));
  });    

// Password Protected route to a user's shopping cart
myRouter.get("/api/me/cart", (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cart));
});

// Password Protected route to add items to a user's shopping cart
myRouter.post("/api/me/cart", (request, response) => {
  const { productId } = request.body;

  const productToAdd = products.find((product) => product.id === productId);
  cart.push(productToAdd);
  
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cart));
});

const uid = require('rand-token').uid;
//const newAccessToken = uid(16);

let accessTokens = [];

// Login call
myRouter.post('/api/login', (request, response) => {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, "Login successful");

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          token: uid(16)
        }
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
var getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken;
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