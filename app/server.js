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
  if (brands.length == 0 ) {
    response.writeHead(503, {'Content-Type': 'text/plain'})
    return response.end("There are currently no brands")
  } else {
    response.writeHead(200, {"Content-type": "application/json"})
    return response.end(JSON.stringify(brands))
  }
})

myRouter.get('/api/brands/:id/products', function(request, response) {
  let patt = new RegExp("^[0-9]*$")

  if (!request.params.id.match(patt)) {
    response.writeHead(503,{'Content-Type': 'text/plain'})
    return response.end("Brand id should contain only numbers")
  }

  let brand = brands.filter((brand) => {
    return brand.id == request.params.id
  })

  if (brand.length == 0) {
    response.writeHead(503,{'Content-Type': 'text/plain'})
    return response.end("There is no brand with that id")
  }

  let productsList = products.filter((product) => {
    return product.categoryId == brand[0].id
  })

  if (productsList.length == 0) {
    response.writeHead(503, {'Content-Type': 'text/plain'})
    return response.end("The given brand has no products")
  }

  response.writeHead(200, {"Content-type": "application/json"})
  return response.end(JSON.stringify(productsList))
})

myRouter.get('/api/products', function(request, response) {
  if(products.length == 0) {
    response.writeHead(503, {'Content-Type': 'text/plain'})
    return response.end("There are no products to return")
  } 
  else {
    response.writeHead(200, {"Content-type": "application/json"})
    return response.end(JSON.stringify(products))
  }

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
        response.writeHead(401, {'Content-Type': 'application/json'});
        return response.end("Invalid username or password");
      }
    } else if (getNumberOfFailedLoginRequestsForUsername(request.body.username) >= 3) {
      response.writeHead(400, {'Content-Type': 'application/json'});
      return response.end("Three incorrect login attempts");
    } else {
      // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
      response.writeHead(400, {'Content-Type': 'application/json'});
      return response.end("Incorrectly formatted response");
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
      }

      let expiredAccessToken = accessTokens.find((accessToken) => {
        return accessToken.token == token && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
      });

      if (expiredAccessToken) {
        return "expired"
      }

      if (!(currentAccessToken) && !(expiredAccessToken)) {
        return "no access token"
      }

    } else {
      return "none";
    }
  };

myRouter.get('/api/me/cart', function(request, response) {
    let accessToken = getValidTokenFromRequest(request);
    if (accessToken == "expired") {
      response.writeHead(400, {'Content-Type': 'application/json'});
      return response.end("Access token has expired");
    } else if (accessToken == "no access token") {
      response.writeHead(400, {'Content-Type': 'application/json'});
      return response.end("Access token does not exist");
    } else if (accessToken == "none") {
      response.writeHead(401, {'Content-Type': 'application/json'});
      return response.end("You need to have access to this call to continue");
    } else {
        const user = users.find((user) => {
            return user.login.username == accessToken.username
        })
        response.writeHead(200, {"Content-type": "application/json"})
        return response.end(JSON.stringify({cart: user.cart, token: accessToken.token}))
    }
})

myRouter.post('/api/me/cart', function(request, response) {
  let accessToken = getValidTokenFromRequest(request);
  if (accessToken == "expired") {
    response.writeHead(400, {'Content-Type': 'application/json'});
    return response.end("Access token has expired");
  } else if (accessToken == "no access token") {
    response.writeHead(400, {'Content-Type': 'application/json'});
    return response.end("Access token does not exist");
  } else if (accessToken == "none") {
    response.writeHead(401, {'Content-Type': 'application/json'});
    return response.end("You need to have access to this call to continue");
  } else {
        const user = users.find((user) => {
            return user.login.username == accessToken.username
        })

        const newItem = products.find((item) => {
          return item.id == request.body.item.id
        })

        if (!newItem) {
          response.writeHead(401, {'Content-Type': 'application/json'});
          return response.end("Item does not exist");
        }

        const repeatItem = user.cart.find((item) => {
          return item.id == request.body.item.id
        })

        if (repeatItem) {
          response.writeHead(401, {'Content-Type': 'application/json'});
          return response.end("Cannot POST multiple of the same item to the cart, you must increment the item quantity using PUT /api/me/cart/:productId");
        }

        newItem["quantity"] = 1
        user.cart.push(newItem)
        response.writeHead(200, {"Content-type": "application/json"})
        return response.end(JSON.stringify({cart: user.cart, token: accessToken.token}))
    }
})

myRouter.delete('/api/me/cart/:productId', function(request, response) {
  let accessToken = getValidTokenFromRequest(request);
  if (accessToken == "expired") {
    response.writeHead(400, {'Content-Type': 'application/json'});
    return response.end("Access token has expired");
  } else if (accessToken == "no access token") {
    response.writeHead(400, {'Content-Type': 'application/json'});
    return response.end("Access token does not exist");
  } else if (accessToken == "none") {
    response.writeHead(401, {'Content-Type': 'application/json'});
    return response.end("You need to have access to this call to continue");
  } else {
        const user = users.find((user) => {
            return user.login.username == accessToken.username
        })

        const toBeDeleted = user.cart.filter((item) => {
          return item.id == request.params.productId
        })

        if (toBeDeleted.length == 0) {
          response.writeHead(401, {'Content-Type': 'application/json'});
          return response.end("This item is not in your cart.");
        }

        user.cart = user.cart.filter((item) => {
            return !(item.id == request.params.productId)
        })
        response.writeHead(200, {"Content-type": "application/json"})
        return response.end(JSON.stringify({cart: user.cart, token: accessToken.token}))
    }
})

myRouter.put('/api/me/cart/:productId', function(request, response) {
  let accessToken = getValidTokenFromRequest(request);
  if (accessToken == "expired") {
    response.writeHead(400, {'Content-Type': 'application/json'});
    return response.end("Access token has expired");
  } else if (accessToken == "no access token") {
    response.writeHead(400, {'Content-Type': 'application/json'});
    return response.end("Access token does not exist");
  } else if (accessToken == "none") {
    response.writeHead(401, {'Content-Type': 'application/json'});
    return response.end("You need to have access to this call to continue");
  } else {
      const user = users.find((user) => {
          return user.login.username == accessToken.username
      })

      const itemToIncrement = user.cart.find((item) => {
        return item.id = request.params.productId
      })

      if (!itemToIncrement) {
        response.writeHead(401, {'Content-Type': 'application/json'});
        return response.end("Item not in cart. You must add an item before incrementing it");
      }

      user.cart = user.cart.map((item) => {
        if (item.id == request.params.productId) {
          item.quantity ++
        }
        return item
      })
      response.writeHead(200, {"Content-type": "application/json"})
      return response.end(JSON.stringify({cart: user.cart, token: accessToken.token}))
  }
})

myRouter.get('/api/search', function(request, response) {
  let patt = new RegExp("\q=(.*)")
  const query = patt.exec(request.url)[1]

  if (query.includes("%20")) {
    response.writeHead(401, {'Content-Type': 'application/json'});
    return response.end("Please enter a one word search term");
  }

  const searchResults = products.filter((product) => {
    return product.name.includes(query) || product.description.includes(query)
  })

  if (searchResults.length == 0) {
    response.writeHead(401, {'Content-Type': 'application/json'});
    return response.end("No items match the entered search term.");
  }
  response.writeHead(200, {"Content-type": "application/json"})
  return response.end(JSON.stringify(searchResults))
})

module.exports = server;