const http = require('http');
const fs = require('fs');
const url = require('url');
const finalHandler = require('finalhandler');
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
const VALID_API_KEYS = ["b04adb11-e837-4aea-be4d-23a3d3791fbf","e3f04ad1-0326-4c2e-bcbe-5f9790b9969c", "d657c35c-2acf-4cdf-a774-8de571ddaf85"];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

// Setup router
const router = Router();
router.use(bodyParser.json());

// Create server
const server = http.createServer((req, res) => {
  if (!VALID_API_KEYS.includes(req.headers["x-authentication"])) {
    res.writeHead(401, "You need to have a valid API key to use this API");
    return res.end();
  } else {
    router(req, res, finalHandler(req, res));
  }
  
});

// Listen to requests
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

// GET all brands - all users can access with API key
router.get("/api/brands", (req, res) => {
  if (!brands) {
    res.writeHead(404, "Brands not found");
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
    res.writeHead(404, "Brand Not Found");
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
    res.writeHead(404, "Products Not Found");
    return res.end();
  } else {
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end(JSON.stringify(products));
  }
});

// Function to get the number of failed requests per username
const getNumberOfFailedLoginRequestsForUsername = username => {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
}

// Function to set the number of failed requests per username
const setNumberOfFailedLoginRequestsForUsername = (username, numFails) => failedLoginAttempts[username] = numFails;

// POST Login call - username and password
router.post('/api/login', (req, res) => {
  // Make sure there is a username and password in the request
  if (req.body.username && req.body.password) {
    // See if there is a user that has that username and password
    let user = users.find(user => {
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

// Function to process access token
const getValidTokenFromRequest = (req) => {
  const parsedUrl = url.parse(req.url, true);
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

// GET Users cart - Only logged in users can access their cart
router.get("/api/me/cart", (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    res.writeHead(401, "You need to have access to this call to continue");
    return res.end();
  } else {
    // Check if current user has a valid access token
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    // Only if the user has a valid access token do we return their cart contents
    if (user) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify(user.cart));
    } else {
      res.writeHead(403, "You don't have access to that cart");
      return res.end();
    }
  }
});

// POST Add a product to your cart - Only logged in users can access their cart
router.post("/api/me/cart", (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    res.writeHead(401, "You need to have access to this call to continue");
    return res.end();
  } else {
    // Check if current user has a valid access token
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    // Only if the user has a valid access token can they add a product to their cart
    if (user) {
      user.cart = [
        ...user.cart,
        {...req.body, quantity: 0}, 
      ];
      res.writeHead(200, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify(user.cart));
    } else {
      res.writeHead(403, "You don't have access to that cart");
      return res.end();
    }
  }
});

// DELETE a specific product from your cart - Only logged in users can access their cart
router.delete("/api/me/cart/:productID", (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    res.writeHead(401, "You need to have access to this call to continue");
    return res.end();
  } else {
    // Check if current user has a valid access token
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    // Only if the user has a valid access token can they delete a product from their cart
    if (user) {
      const { productID } = req.params;
      if (!user.cart) {
        res.writeHead(404, "Your shopping cart is empty");
        return res.end();
      } else {
        const newCart = user.cart.filter(cartItem => cartItem.id !== productID);
        user.cart = newCart;
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify(user.cart));
      }
    } else {
      res.writeHead(403, "You don't have access to that cart");
      return res.end();
    }
  }
});

// POST Change quantity of a product in your cart - Only logged in users can access their cart
router.post("/api/me/cart/:productID", (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req);

  if (!currentAccessToken) {
    // If there isn't a access token in the request, we know that the user isn't logged in, so don't continue
    res.writeHead(401, "You need to have access to this call to continue");
    return res.end();
  } else {
    // Check if current user has a valid access token
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    // Only if the user has a valid access token can they increase the product quantity in their cart
    if (user) {
      const { productID } = req.params;
      if (!user.cart) {
        res.writeHead(404, "Your shopping cart is empty");
        return res.end();
      } else {
        user.cart.map(item => {
          if (item.id == productID) {
            item.quantity += 1;
          } else {
            res.writeHead(404, "Product not found in your cart");
            return res.end();
          }
        })
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify(user.cart));
      }
    } else {
      res.writeHead(403, "You don't have access to that cart");
      return res.end();
    }
  }
});

module.exports = server;