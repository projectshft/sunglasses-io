const http = require('http');
const fs = require('fs');
const url = require('url');
const finalHandler = require('finalhandler');
var queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
var uid = require('rand-token').uid;

// 2 day timeout set for login access token
const TOKEN_VALIDITY_TIMEOUT = 2 * 24 * 60 * 60 * 1000;

//state holding variables
let brands = [];
let products = [];
// let cart = [];
let users = [];
// let user = {};
// let accessTokens = [];

//a hardcoded access token for testing
let accessTokens = [
  {
    username: 'yellowleopard753',
    lastUpdated: 'Wed Sep 23 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
    token: '12345678abcdefgh',
  },
];
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
  brands_empty = JSON.parse(
    fs.readFileSync('initial-data/brands_empty.json', 'utf-8')
  );

  //populate products
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));

  //populate users
  users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));
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
    response.writeHead(204, 'There are no brands to return');
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

router.get('/api/brands/:brandId/products', (request, response) => {
  // Return all products associated with a brand of sunglasses
  const { brandId } = request.params;

  const selectedBrand = [];
  brands.forEach((brand) => {
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

//only included for error testing; not in Swagger API definitions
router.get('/api/brands//products', (request, response) => {
  response.writeHead(400, 'Missing brandId in request');
  return response.end();
});

router.get('/api/products', (request, response) => {
  let parsedUrl = require('url').parse(request.url, true);
  let productsToReturn = [];

  //confirm that search term was entered
  if (parsedUrl.query.searchTerm) {
    // convert search term to lower case
    let searchTermLC = parsedUrl.query.searchTerm.toLowerCase();
    products.forEach((product) => {
      //convert product names to lower case
      let productNameLC = product.name.toLowerCase();
      //find matches and push to array of productsToReturn
      if (productNameLC.includes(searchTermLC)) {
        productsToReturn.push(product);
        return productsToReturn;
      }
    });
    if (productsToReturn.length === 0) {
      response.writeHead(
        204,
        'No matching products found. Please search again',
        { 'Content-Type': 'application/json' }
      );
      return response.end();
    } else {
      response.writeHead(200, 'Product found', {
        'Content-Type': 'application/json',
      });
      return response.end(JSON.stringify(productsToReturn));
    }
  }
  response.writeHead(400, 'Search term required. Please try again', {
    'Content-Type': 'application/json',
  });
  return response.end();
});

// Helpers to get/set our number of failed requests per username
let getNumberOfFailedLoginRequestsForUsername = function (username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
};

let setNumberOfFailedLoginRequestsForUsername = function (username, numFails) {
  failedLoginAttempts[username] = numFails;
};

// Login call
router.post('/api/login', (request, response) => {
  let parsedUrl = require('url').parse(request.url, true);

  // Make sure there is a username and password in the request & that #of failed attempts<3
  if (
    parsedUrl.query.username &&
    parsedUrl.query.password &&
    getNumberOfFailedLoginRequestsForUsername(parsedUrl.query.username) < 3
  ) {
    // See if there is a user that has that username and password
    let user = users.find((user) => {
      return (
        user.login.username == parsedUrl.query.username &&
        user.login.password == parsedUrl.query.password
      );
    });
    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumberOfFailedLoginRequestsForUsername(parsedUrl.query.username, 0);

      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, { 'Content-Type': 'application/json' });

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
      // Update the number of failed login attempts
      let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(
        parsedUrl.query.username
      );
      setNumberOfFailedLoginRequestsForUsername(
        parsedUrl.query.username,
        ++numFailedForUser
      );
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, 'Invalid username or password entered');
      return response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the input parameters
    response.writeHead(400, 'Invalid username or password entry syntax');
    return response.end();
  }
});

// Helper method to process access token
let getValidTokenFromRequest = function (request) {
  let newValidAccessToken;
  if (request.body.token) {
    // Verify the access token in the request to make sure is valid and not expired
    accessTokens.find((accessToken) => {
      let now = new Date();
      //need to convert to date string to compare with request body date format
      let requestTokenDate = new Date(request.body.lastUpdated);
      if (
        //verify that the request token matches a valid token
        accessToken.token == request.body.token &&
        //verify that the request update date is valid
        now - requestTokenDate < TOKEN_VALIDITY_TIMEOUT
      ) {
        //create a new current token and update date
        newValidAccessToken = {
          username: request.body.username,
          lastUpdated: new Date(),
          token: request.body.token,
        };
      }
    });
    if (newValidAccessToken) {
      return newValidAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// Only logged in users can access their cart
router.get('/api/me/cart', (request, response) => {
  //check for username in token
  if (!request.body.username) {
    response.writeHead(401, 'You need valid login credentials to continue');
    return response.end();
  }
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't a valid access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, 'You need valid login credentials to continue');
    return response.end();
  } else {
    let userCart;
    users.find((user) => {
      //confirm that username assigned to token is valid
      if (user.login.username == currentAccessToken.username) {
        //if valid, grab cart
        userCart = user.cart;
        return userCart;
      } else {
        //if not, error out
        response.writeHead(401, 'You need valid login credentials to continue');
        return response.end();
      }
    });
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(userCart));
  }
});

router.post('/api/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, 'You need valid login credentials to continue');
    return response.end();
  } else {
    // Find cart for the valid user
    let userCart = [];
    users.find((user) => {
      //confirm that username assigned to token is valid
      if (user.login.username == currentAccessToken.username) {
        //if valid, grab cart
        userCart = user.cart;
        return userCart;
      } else {
        //if not, error out
        response.writeHead(401, 'You need valid login credentials to continue');
        return response.end();
      }
    });

    let parsedUrl = require('url').parse(request.url, true);
    //check that productId was included
    if (!parsedUrl.query.productId) {
      response.writeHead(400, 'ProductId required. Please search again', {
        'Content-Type': 'application/json',
      });
      return response.end();
    }

    let firstUserCartlength = userCart.length;
    let newUserCart = userCart;

    products.forEach((product) => {
      //find matching product and push into cart
      if (product.id === parsedUrl.query.productId) {
        newUserCart.push(product);
        return newUserCart;
      }
    });

    if (newUserCart.length === firstUserCartlength) {
      response.writeHead(
        204,
        'No matching products found. Please search again',
        { 'Content-Type': 'application/json' }
      );
      return response.end();
    } else {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify(newUserCart));
    }
  }
});

module.exports = server;
