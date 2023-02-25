const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

// State holding variables
let brands = [];
let products = [];
let users = [];
let accessTokens = [];
let failedLoginAttempts = {};

const PORT = process.env.PORT || 3001;
const VALID_API_KEYS = ["88312679-04c9-4351-85ce-3ed75293b449","1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7"];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  if (!VALID_API_KEYS.includes(req.headers["x-authentication"])) {
    res.writeHead(401, "You need to have a valid API key to use this API");
    return res.end();
  } else {
    router(req, res, finalHandler(req, res));
  }
  
});

server.listen(PORT, "127.0.0.1", (err) => {
  if (err) {
    return console.log('Error on Server Startup: ', err)
  } else{
    console.log(`Server running on port ${PORT}`);

    // Populate brands
    fs.readFile("./initial-data/brands.json", "utf-8", (err, data) => {
      if (err) {
            throw err;
      } else {
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
      }
    })

    // Populate products
    fs.readFile("./initial-data/products.json", "utf-8", (err, data) => {
      if (err) {
        throw err;
      } else {
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
      }
    });

    // Populate users
    fs.readFile("./initial-data/users.json", "utf-8", (err, data) => {
      if (err) {
        throw err;
      } else {
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
      }
    });
  }
});

// GET all brands - All users can access with API key
router.get("/api/brands", (req, res) => {
  if (!brands) {
    res.writeHead(404, "There aren't any brands to return");
    res.end();
  } else {
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end(JSON.stringify(brands));
  }
});

// GET all products from a chosen brand - All users can access with API key
router.get("/api/brands/:categoryId/products", (req, res) => {
  const { categoryId } = req.params;
  const brand = brands.find(brand => brand.id == categoryId);
  if (!brand) {
    res.writeHead(404, "That brand does not exist");
    return res.end();
  } else {
    const relatedProducts = products.filter(product => product.categoryId === categoryId);
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end(JSON.stringify(relatedProducts));
  }
});

// GET all products - All users can access with API key
router.get("/api/products", (req, res) => {
  if (!products) {
    res.writeHead(404, "There aren't any products to return");
    return res.end();
  } else {
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end(JSON.stringify(products));
  }
});

// Helper to get the number of failed requests per username
const getNumberOfFailedLoginRequestsForUsername = function(username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
}

// Helper to set the number of failed requests per username
const setNumberOfFailedLoginRequestsForUsername = function(username, numFails) {
  failedLoginAttempts[username] = numFails;
}

// POST Login call
router.post('/api/login', function(req, res) {
  // Make sure there is a username and password in the request
  if (req.body.username && req.body.password) {
    // See if there is a user that has that username and password
    let user = users.find((user) => {
      return user.login.username == req.body.username && user.login.password == req.body.password;
    });

    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumberOfFailedLoginRequestsForUsername(req.body.username, 0);

      // Write the header because we know we will be returning successful at this point and that the response will be json
      res.writeHead(200, {'Content-Type': 'application/json'});

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return res.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return res.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // Update the number of failed login attempts
      let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(req.body.username);
      setNumberOfFailedLoginRequestsForUsername(req.body.username, ++numFailedForUser);
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      res.writeHead(401, "Invalid username or password");
      return res.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    res.writeHead(400, "Incorrectly formatted response");
    return res.end();
  }
});

// Helper method to process access token
const getValidTokenFromRequest = function(req) {
  const parsedUrl = require('url').parse(req.url,true)
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

// GET cart - Only logged in users can access their cart
router.get("/api/me/cart", (req, res) => {
  // Check if the current user has access to the store
  let user = users.find((user) => {
    return user.email == currentAccessToken.email;
  });
  if (!users) {
    res.writeHead(404, "There aren't any brands to return");
    res.end();
  } else {
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end(JSON.stringify(user));
  }
});

// POST
router.post("/api/me/cart", (req, res) => {
  
});

// DELETE
router.delete("/api/me/cart/:productID", (req, res) => {
  
});

// POST
router.post("/api/me/cart/:productID", (req, res) => {
  
});

module.exports = server;