var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
// to parse request bodies
var bodyParser   = require('body-parser');
// to generate access tokens
var uid = require('rand-token').uid;
const url = require('url');

let brands = [];
let products = [];
let users = [];
let accessTokens = [];
let failedLoginAttempts = {};

const PORT = 3001;
// setup router
const myRouter = Router();
myRouter.use(bodyParser.json());
// create server and import data from files in the project
let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
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

// create route for brands, will return an array of objects aka the brands
myRouter.get('/api/brands', function(request,response) {
  if (brands) {
    response.writeHead(200, { "Content-Type": "application/json" });
    // return the brands
    return response.end(JSON.stringify(brands));
  }
});

// create route to get products related to a certain brand
myRouter.get('/api/brands/:brandId/products', function(request, response) {
  //verify that the brandId exists and matches with an Id we have
  let brand = brands.find((brand) => {
    return brand.id == request.params.brandId
  })
  //if the brand does not exist, return an error
  if (!brand) {
    response.writeHead(404, "The brand ID is incorrect");
    response.end()
  }
  else {
    response.writeHead(200, { "Content-Type": "application/json" });
    let productsAssociatedWithThisBrand = products.filter((product) => {
      return product.categoryId === request.params.brandId
    })
    // return all of the products associated with the brand
    return response.end(JSON.stringify(productsAssociatedWithThisBrand))
  } 
});

// create route for products, utilizes a search query, if none is given returns all products
myRouter.get('/api/products', function(request,response) {
  // need to create some if statements for search query 
  if (products) {
    response.writeHead(200, { "Content-Type": "application/json" });
    // return the products
    return response.end(JSON.stringify(products));
  }
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
// create a route for user login
myRouter.post('/api/login', function(request,response) {
  // Check for a username and password in the request
  if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
    // See if there is a user that has that username and password
    let user = users.find((user)=>{
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumberOfFailedLoginRequestsForUsername(request.body.username,0);

      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200,{'Content-Type': 'application/json'});

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



module.exports = server;

