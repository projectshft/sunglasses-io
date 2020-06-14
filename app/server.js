var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
//failed 

const PORT = 3001;
// State holding variables
let brands = []
let products = []
let users = []
var accessTokens = ['123456'];
var failedLoginAttempts = {};
let cart = []

// Setup Router
const myRouter = Router()
myRouter.use(bodyParser.json())

const server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
});

server.listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('./initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// GET api brands
myRouter.get('/api/brands', function(request, response) {
    response.writeHead(200, {'Content-Type': 'application/json'})
    return response.end(JSON.stringify(brands))
  });

// GET api brand products
myRouter.get('/api/brands/:id/products', function(request, response) {
  // return brand that matches id and save it as brand
  let brand = brands.find(brand => {
    if (brand.id == request.params.id) {
      return true
    }
  })
  if (!brand) {
    // If there isns't a brand with that id, return a 404
    response.writeHead(404, "That brand cannot be found");
    return response.end();
  } else {
    // if there is a successful brand id, save all the products of that brand in brandProducts
    let brandProducts = products.reduce((accumulator, currentValue) => {
      if (currentValue.categoryId == request.params.id) {
        accumulator.push(currentValue)
      }
      return accumulator;
    },[])
    response.writeHead(200, {'Content-Type': 'application/json'})
    return response.end(JSON.stringify(brandProducts))
  }
});

// GET api products
myRouter.get('/api/products/:query', function(request, response) {
  // get query from url
  let query = request.params.query
  // find query inside description or name strings
  let result = products.reduce((accumulator, product) => {
    if (product.description.includes(query) || product.name.includes(query)) {
      accumulator.push(product)
    }
    return accumulator
  }, [])
  // if there was at least one result found, return result
  if (result.length > 0) {
    response.writeHead(200, {'Content-Type': 'application/json'})
    return response.end(JSON.stringify(result))
  } else if (result.length === 0) {
    // else return no results found
    response.writeHead(200, {'Content-Type': 'application/json'})
    return response.end('No results found matching your search')
  }
});

myRouter.get('/api/products/', function(request, response) {
  // if query empty, return error
    response.writeHead(400, 'incorrectly formatted response')
    return response.end() 
});



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

// GET api cart
myRouter.get('/api/me/cart', function(request, response) {
  // check if accessToken exists and if it matches any in accessTokens array
  if (request.body.hasOwnProperty('accessToken')) {
    accessToken = accessTokens.find(token => {
      if (token == request.body.accessToken) {
        return true
      }
    })
    if (accessToken) {
      response.writeHead(200, {'Content-Type': 'application/json'})
      return response.end(JSON.stringify(cart))
    } else {
      // if accessToken doesn't match, return error
      response.writeHead(401, "You need to have access to this call to continue");
      return response.end();
    }
  } else {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  }
});

// POST to api cart
myRouter.post('/api/me/cart/:id', function(request, response) {
  // check if accessToken exists and if it matches any in accessTokens array
  if (request.body.hasOwnProperty('accessToken')) {
    accessToken = accessTokens.find(token => {
      if (token == request.body.accessToken) {
        return true
      }
    })
    if (accessToken) {
      let product = products.find(product => {
        if (product.id == request.params.id) {
          return true
        }
      });
      if (product) {
        cart.push(product)
        response.writeHead(200, {'Content-Type': 'application/json'})
        return response.end()
      } else {
        response.writeHead(404, {'Content-Type': 'application/json'})
        return response.end()
      }
    } else {
      // if accessToken doesn't match, return error
      response.writeHead(401, "You need to have access to this call to continue");
      return response.end();
    }
  } else {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  }
});




module.exports = server