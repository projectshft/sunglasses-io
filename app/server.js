var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;

let brands = [];
let NumofBrands = 5;
let users = [];
let accessTokens = [];
let failedLoginAttempts = {};

//set up server
const PORT = 3001;


// Setup router
const router = Router();
router.use(bodyParser.json());

//set up server
const server = http.createServer((request, response) => {
    response.writeHead(200);
    router(request, response, finalHandler(request, response));
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

  // const saveCurrentUser = (currentUser) => {
  //   // set hardcoded "logged in" user
  //   users[0] = currentUser;
  //   fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
  // }


  //RETURNS ALL BRANDS
  router.get("/api/brands", (request, response) => {
    //is there no need for a query since they are all being returned?
    if (!brands) {
      response.writeHead(404, "No brands to return");
      return response.end();
    } else 
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(brands));
    });

  //GET PRODUCTS BY BRAND ID
  router.get("/api/brands/:id/products", (request, response) => {
    const { id } = request.params;
    const productList = products.filter(product => product.categoryId.includes(id));
    const numId = parseInt(id, 10)
      
    if (numId >= NumofBrands) { //hardcode number of brands. this says that the number of brands can't be more than 5, probably a better way to do this
      response.writeHead(404, "That brand does not exist");
      return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productList));
  });

  //GET PRODUCTS BY SEARCH
  router.get("/api/products", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl); //parse the url to get the query
    const { query } = queryString.parse(parsedUrl.query);
    let productsToReturn = [];

    if (query) {//if the query is defined, filter the products by query and assign them to productsToReturn
      productsToReturn = products.filter(product => product.description.includes(query));

      //if (!productsToReturn) 
      if (!productsToReturn) {//if the query is defined but there are no goals to return, 404 error || I tried to use (!productsToReturn) but this didn't work
        response.writeHead(404, "There aren't any goals to return");
        return response.end();
      }
    } else {
      productsToReturn = products;
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productsToReturn));
  });

//In order to know if the person has a valid account, 
//we need to set up an authentication entry point and issue 
//an authorization challenge.

//We need to set up a way for people to log 
//in and then provide something on the server that can validate 
//their login and give them access or not based on their login.

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

//mainly from auth assignment
// POST USER LOGIN WITH USERNAME AND PASSWORD
router.post('/api/login', function(request,response) {
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

//this is from authentication assignment
// Helper method used to validate access tokens for cart functions
var getValidTokenFromRequest = function(request) {
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
 

module.exports = server
