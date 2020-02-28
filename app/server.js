var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; 
const failedLoginAttempts = {};
const newAccessToken = uid(16);

let brands = [];
let users = [];
let products = [];
let accessTokens = [];


//functions to check for password attempts
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
  
// Helper method to process access token
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

  // Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = 
http.createServer((request, response) => {

myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }
  fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// Route for the brands 
myRouter.get('/api/brands', function(request,response) {
    response.writeHead(200, {'Content-Type': 'application/json'})
    return response.end(JSON.stringify(brands))

  });

myRouter.get("/api/brands/:id/products", (request, response) => {
    //filter for product list by category id(brand name)
    const productlistbybrand = products.filter((product) => {
       return product.categoryId == request.params.id;})
    if(productlistbybrand.length === 0 ) {
        response.writeHead(404, "That brand cannot be found") ;
        return response.end(); 
    } 
      response.writeHead(200, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(productlistbybrand));
    });
  
  // Route for the products 
myRouter.get('/api/products', function(request,response) {
    response.writeHead(200, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(products))
    
      });  
    
// Route for the shopping cart
myRouter.get('/api/me/cart', function(request,response) {
    //verifying token
    let currentAccessToken = getValidTokenFromRequest(request);
    //must login in to get cart
    if (!currentAccessToken) {
        // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
        response.writeHead(401, "You need to log in to recieve cart information");
        return response.end();
    }else{
        //search to see if username and password match
        let user = users.find((user)=>{
        return user.login.username == currentAccessToken.username
    });
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart))
   }
});

myRouter.post('/api/me/cart', function (request, response){
    let currentAccessToken = getValidTokenFromRequest(request);
    //must login in to get cart
    if (!currentAccessToken) {
        // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
        response.writeHead(401, "You need to log in to recieve cart information");
        return response.end();
    }else{
        //search to see if username and password match
        let user = users.find((user)=>{
        return user.login.username == currentAccessToken.username
    });
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart))
   }
});


// Login call
myRouter.post('/api/login', function(request,response) {
 
    // Make sure there is a username and password in the request
    if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
      // See if there is a user that has that username and password
     
      let user = users.find((user)=>{
        return user.login.username == request.body.username && user.login.password == request.body.password;
      });
      if (user) {
        setNumberOfFailedLoginRequestsForUsername(request.body.username, 0);
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
        let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
        setNumberOfFailedLoginRequestsForUsername(request.body.username, ++numFailedForUser);
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