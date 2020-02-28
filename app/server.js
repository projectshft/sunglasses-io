var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var failedLoginAttempts = {};
var accessTokens = [];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

const uid = require('rand-token').uid;
const newAccessToken = uid(16);

const PORT = 3001;

// State holding variables
let brands = []
let products = []
let users = []

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
        }

    fs.readFile("./initial-data/products.json", "utf8", (error, data)=>{
        if (error) throw error;
        products = JSON.parse(data)
        console.log(`Server setup: ${products.length} products loaded`);

    })

    fs.readFile("./initial-data/brands.json", "utf8", (error, data)=>{
        if (error) throw error;
        brands = JSON.parse(data)
        console.log(`Server setup: ${brands.length} brands loaded`);
    })

    fs.readFile("./initial-data/users.json", "utf8", (error, data)=>{
        if (error) throw error;
        users = JSON.parse(data)
        console.log(`Server setup: ${users.length} users loaded`);
    })
    }
)

myRouter.get('/api/brands', function(request, response) {
    response.writeHead(200, {"Content-type": "application/json"})
    return response.end(JSON.stringify(brands))
})

myRouter.get('/api/brands/:id/products', function(request, response) {
    let productsList = products.filter((product) => {
        return product.categoryId == request.params.id
    })
    response.writeHead(200, {"Content-type": "application/json"})
    return response.end(JSON.stringify(productsList))
})

myRouter.get('/api/products', function(request, response) {
    response.writeHead(200, {"Content-type": "application/json"})
    return response.end(JSON.stringify(products))
})

// Helpers to get/set our number of failed requests per username
var getNumberOfFailedLoginRequestsForUsername = function(username) {
    let currentNumberOfFailedRequests = failedLoginAttempts[username];
    if (currentNumberOfFailedRequests) {
      return currentNumberOfFailedRequests;
    } else {
      return 0;
    }
  }
  
  var setNumberOfFailedLoginRequestsForUsername = function(username,numFails) {
    failedLoginAttempts[username] = numFails;
  }
  
  // Login call
  myRouter.post('/api/login', function(request,response) {
    // Make sure there is a username and password in the request
    if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
      // See if there is a user that has that username and password
      let user = users.find((user)=>{
        return user.login.username == request.body.username && user.login.password == request.body.password;
      });
      if (user) {
        // If we found a user, reset our counter of failed logins
        setNumberOfFailedLoginRequestsForUsername(request.body.username,0);
  
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
        setNumberOfFailedLoginRequestsForUsername(request.body.username,++numFailedForUser);
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
    var token = request.body.token
    if (token) {
      // Verify the access token to make sure its valid and not expired
      let currentAccessToken = accessTokens.find((accessToken) => {
        return accessToken.token == token && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

myRouter.get('/api/me/cart', function(request, response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
      response.writeHead(401, "You need to have access to this call to continue", CORS_HEADERS);
      return response.end();
    } else {
        const user = users.find((user) => {
            return user.login.username == currentAccessToken.username
        })
        const shoppingCart = user.cart
        response.writeHead(200, {"Content-type": "application/json"})
        return response.end(JSON.stringify(shoppingCart))
    }
})

myRouter.post('/api/me/cart', function(request, response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
      response.writeHead(401, "You need to have access to this call to continue", CORS_HEADERS);
      return response.end();
    } else {
        const user = users.find((user) => {
            return user.login.username == currentAccessToken.username
        })
        const shoppingCart = user.cart
        shoppingCart.push(request.body.item)
        response.writeHead(200, {"Content-type": "application/json"})
        return response.end(JSON.stringify(shoppingCart))
    }
})

myRouter.delete('/api/me/cart/:productId', function(request, response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
      response.writeHead(401, "You need to have access to this call to continue", CORS_HEADERS);
      return response.end();
    } else {
        const user = users.find((user) => {
            return user.login.username == currentAccessToken.username
        })
        const shoppingCart = user.cart
        user.cart = user.cart.filter((item) => {
            return !(item.id == request.params.id)
        })
        response.writeHead(200, {"Content-type": "application/json"})
        return response.end(JSON.stringify(shoppingCart))
    }
})




module.exports = server
