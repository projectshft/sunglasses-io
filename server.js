var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// State holding variables
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {

  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => { 
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });

  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if(error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  })
  
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
});

// gets all brands 
myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));

});

// gets all products of brand with specified id
myRouter.get('/api/brands/:id/products', function(request, response) {
  // variable for brand with associated :id
  const brandSelection = brands.find((brand) => {
    return brand.id == request.params.id;
  });
  // handles case of undefined brandSelection variable due to invalid :id brand
  if(!brandSelection){
    response.writeHead(500);
    return response.end("Brand not found, no products found.");
  }
  // variable for products associated with brand :id
  const brandProducts = products.filter((products) => {
    return products.categoryId == brandSelection.id;
  });

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brandProducts));
});

// gets all products 
myRouter.get('/api/products', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(products));
});

// handles login attempt
myRouter.post('/api/login', function(request, response) {
  // checks username and password input to verify authorization
  if(request.body.username && request.body.password){
    let user = users.find((user) => {
      return user.login.username == request.body.username && 
      user.login.password == request.body.password;
    });
    // input username and password for a user are found and match and login is successful
    if(user){
      response.writeHead(200, {"Content-Type": "application/json"});
      // access token created
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });
      // Update access token timeout period if it exists
      if(currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
        // create new access token with user and "random" token
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        console.log("server token: ");
        accessTokens.push(newAccessToken);
        console.log(newAccessToken.token);
        // console.log("request: ");
        // console.log(request);
        console.log("request.body: ");
        console.log(request.body);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }

  } else if(request.body.username == undefined || request.body.password == undefined){
    response.writeHead(400, "Incorrectly formatted response: missing username and/or password input");
    return response.end();
  } 
});

// Helper method to process access token
var getValidTokenFromRequest = function(request) {
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

myRouter.get('/api/me/cart', function(request, response) {

});

myRouter.post('/api/me/cart', function(request, response) {

});

myRouter.delete('/api/me/cart/:productId', function(request, response) {

});

myRouter.post('/api/me/cart/:productId', function(request, response) {

});

module.exports = server;