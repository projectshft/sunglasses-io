const http = require('http');
const fs = require('fs');
const url = require('url');
const finalHandler = require('finalhandler');
var queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
var uid = require('rand-token').uid;

//15 minute timeout set for login access token
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

//state holding variables
let brands = [];
let products = [];
let cart = [];
let users = [];
// let user = {};
let accessTokens = [];
let failedLoginAttempts = {};


const PORT = 3001;

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  router(request, response, finalHandler(request, response));
});

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  // populate brands
  brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));

  // populate empty brands
  brands_empty = JSON.parse(fs.readFileSync('initial-data/brands_empty.json', 'utf-8'));

  //populate products
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
  
  // hard code "logged in" user
  // user = users[0];

  //hard code one item in cart
  // cart = [products[0]];

});

router.get('/api/brands', (request, response) => {
  // Return all brands in the db
  if (brands.length === 0) {
    response.writeHead(204, "There aren't any brands to return");
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

router.get('/api/brands_empty', (request, response) => {
  // Error if there are no brands
  if (brands_empty.length === 0) {
    response.writeHead(204, "There are no brands to return");
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

router.get('/api/brands/:brandId/products', (request, response) => {
  // Return all products associated with a brand of sunglasses
  const { brandId } = request.params;
  const selectedBrand = [];
  brands.forEach(brand => {
    if (brand.id == brandId) { 
      selectedBrand.push(brand);
    }
  });
  const productsByBrandId = [];
  products.forEach((product) => {
    if (product.categoryId == brandId) {
      productsByBrandId.push(product);
    }
    return productsByBrandId;
  });
    
  if (selectedBrand.length === 0) {
    response.writeHead(204, 'That brand or product was not found');
    return response.end();
  }  
  if (productsByBrandId.length === 0) {
    response.writeHead(204, 'That brand or product was not found');
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(productsByBrandId));
});

router.get('/api/products', (request, response) => {
  let parsedUrl = require('url').parse(request.url, true);
  let productsToReturn = [];

  //confirm that search term was entered
  if (parsedUrl.query.searchTerm) {
    // See if there is an exact match and password
    let searchTermLC = parsedUrl.query.searchTerm.toLowerCase();
    products.forEach((product) => {
      let productNameLC = product.name.toLowerCase();
      if (productNameLC.includes(searchTermLC)) {
        productsToReturn.push(product);
        return productsToReturn;
      }
    });
    if (productsToReturn.length === 0) {
      response.writeHead(204, "No matching products found. Please search again", { "Content-Type": "application/json" });
      return response.end();
    } else {
      response.writeHead(200, "Product found", { "Content-Type": "application/json" });
      return response.end(JSON.stringify(productsToReturn));
    }
  }
});



// Helpers to get/set our number of failed requests per username
let getNumberOfFailedLoginRequestsForUsername = function(username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
}

let setNumberOfFailedLoginRequestsForUsername = function(username, numFails) {
  failedLoginAttempts[username] = numFails;
}

// Login call
router.post('/api/login', (request,response) => {
  let parsedUrl = require('url').parse(request.url,true)

  // Make sure there is a username and password in the request & that #of failed attempts<3
  if (parsedUrl.query.username && parsedUrl.query.password && getNumberOfFailedLoginRequestsForUsername(parsedUrl.query.username) < 3) {
    // See if there is a user that has that username and password
    let user = users.find((user)=>{
      return user.login.username == parsedUrl.query.username && user.login.password == parsedUrl.query.password;
    });
    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumberOfFailedLoginRequestsForUsername(parsedUrl.query.username, 0);

      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, {'Content-Type': 'application/json'});

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
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // Update the number of failed login attempts
      let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
      setNumberOfFailedLoginRequestsForUsername(parsedUrl.query.username, ++numFailedForUser);
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, "Invalid username or password entered");
      return response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the input parameters
    response.writeHead(400, "Invalid username or password entry syntax");
    return response.end();
  }
});

// Helper method to process access token
let getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url,true)
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure its valid and not expired
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




module.exports = server;
