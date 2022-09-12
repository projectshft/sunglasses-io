var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var url = require("url");
const { isArgumentsObject } = require('util/types');
var uid = require('rand-token').uid;

const PORT = 3001;
// State holding variables
let cart = [];
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

// Access tokens should expire after 15 mins
const tokenTimeout = 15 * 60 * 1000;

// Set up router
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile("../initial-data/brands.json", "utf-8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    // console.log(`Server setup: ${brands.length} brands loaded`);
  });

  fs.readFile("../initial-data/products.json", "utf-8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    // console.log(`Server setup: ${products.length} products loaded`);
  });

  fs.readFile("../initial-data/users.json", "utf-8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    // console.log(`Server setup: ${users.length} users loaded`);
  });

  console.log(`Server is listening on ${PORT}`);
});

myRouter.get("/brands", (request, response) => {
  // Return all the brands in the database
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get("/brands/:id/products", (request, response) => {
  const id = request.params.id;
  let brand = brands.find((brand => brand.id == id));

  // Return 404 if not found
  if (!brand) {
    response.writeHead(404);
    return response.end("Brand not found");
  }

  // Otherwise return array of products with brand
  let productsWithBrand = products.filter(product => product.categoryId == id);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsWithBrand));
});

myRouter.get("/products", (request, response) => {
  // Return all the products relevant to a search query
  const parsedUrl = url.parse(request.originalUrl);
  let { query } = queryString.parse(parsedUrl.query);
  query = query.toLowerCase();
  // return a 400 if query is too short
  if (query.length < 3) {
    response.writeHead(400, "Invalid search query. Query must contain more than 3 characters");
    return response.end();
  } else {
    // otherwise return the relevant products
    let productsToReturn = products.filter((product) => {
      if (product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });
    // return a 404 if no search results are found
    if (!productsToReturn.length) {
      response.writeHead(404, "No products were found.");
      return response.end();
    } else {
      response.writeHead(200, {"Content-Type": "application/json" });
      return response.end(JSON.stringify(productsToReturn));
    }
  }
});

myRouter.post("/login", (request, response) => {
  // Make sure there is a username and password in request
  if (request.body.username && request.body.password) {
    // Check if the credentials are valid
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password
    });
    if (user) {
      response.writeHead(200, {"Content-Type": "application/json"});

      // If we have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username
      });

      // If there is one, update its last updated value
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token))
      } else {
        // Otherwise create a new token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16),
        };
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken));
      }
    } else {
      // If credentials are invalid
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    // If username or password is absent in request
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

myRouter.get("/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    // If there is no valid access token, then return a 401
    response.writeHead(401, "You must be logged in to view cart.");
    return response.end();
  } else {
    // Otherwise, return cart
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(cart));
  }
});

// Helper method to process access token
const getValidTokenFromRequest = (request) => {
  let parsedUrl = url.parse(request.originalUrl);
  let queryToken = queryString.parse(parsedUrl.query).token;
  console.log(`queryToken: ${queryToken}`);
  if (queryToken) {
    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token = queryToken && ((new Date()) - accessToken.lastUpdated) < tokenTimeout;
    });
    console.log(`currentAccessToken: ${currentAccessToken}`)
    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// functions to update state for the sake of testing
const addToCart = (product) => {
  let newProduct = {
    count: 0,
    ...product
  };
  let productInCart = cart.find(product => product.id == newProduct.id);
  if (productInCart) {
    let productInCartIndex = cart.indexOf(productInCart);
    cart[productInCartIndex] = {...productInCart, count: productInCart.count+1};
  } else {
    cart.push(newProduct);
  }
};

exports.updateAccessTokens = (newToken) => {
  accessTokens.push(newToken);
};

exports.clearState = () => {
  cart = [];
  accessTokens = [];
};

exports.addToCart = addToCart;
exports.server = server;
