var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const url = require("url");

// State holding variables
let products = [];
// let user = {};
let brands = [];
let users = [];
let accessTokens = [];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

const PORT = 3001;

// Helper method to process access token
var getValidTokenFromRequest = function (request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

// Set up router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  //populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  
  // hardcode "logged in" user
  // user = users[0];
});


// endpoint handlers: router.get, router.post

// GET BRANDS
router.get("/api/brands", (request, response) => {
  let brandsToReturn = brands;
  if (brandsToReturn.length === 0) {
    response.writeHead(404, "No brands found");
    return response.end();
  } 
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
});

// GET PRODUCTS BY BRAND 
router.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const brand = brands.find(brand => brand.id === id);
  if (!brand) {
    response.writeHead(404, "Brand does not exist");
    return response.end();
  }
  const productsToReturn = products.filter(
    product => product.brandId === id
  );
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

// GET PRODUCTS
router.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let productsToReturn = []; 
  if (query !== undefined) {
    productsToReturn = products.filter(product => 
      product.name.includes(query) || product.description.includes(query)
    );
    if (productsToReturn.length === 0) {
      response.writeHead(404, "No products found");
      return response.end();
    }
  } else {
    productsToReturn = products; 
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

// LOGIN 
router.post('/api/login', function (request, response) {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
}); 

// GET CART
router.get('/api/me/cart', function (request, response) { 
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "You need to log in to access the cart");
    return response.end();
  } else { 
    let currentUser = currentAccessToken.username;
    let user = users.find((user) => {
      return user.login.username == currentUser;
    });
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
}); 

module.exports = server;