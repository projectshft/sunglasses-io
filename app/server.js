var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
// State holding variables
var brands = [];
var products = [];
var users = [];
var cart = [];
var failedLoginAttempts = [];
var accessTokens = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
    if (request.url.includes('api')) {
        response.writeHead(200, {'Content-Type': 'application/json'});
        myRouter(request, response, finalHandler(request, response))
      } else {
        serve(request,response, finalHandler(request,response))
      }
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// All users may access this information
myRouter.get('/api/brands', function(request,response) {
    response.end(JSON.stringify(brands));
});
// All users may access this information
myRouter.get('/api/brands/:id/products', function(request,response) {
    response.end(JSON.stringify(products[request.params.categoryId]));
});
// All users may access this information
myRouter.get('/api/products', function(request,response) {
    response.end(JSON.stringify(products));
});
 
// User's must login to use and change the cart
myRouter.post('/api/login', function(request,response) {
    // Make sure there is a username and password in the request
    if (request.body.username && request.body.password) {
      // See if there is a user that has that username and password 
      if (!failedLoginAttempts[request.body.username]){
        failedLoginAttempts[request.body.username] = 0;
      }
      if (request.body.username && request.body.password && failedLoginAttempts[request.body.username] < 3) {
          let user = users.find((user)=>{
              return user.login.username == request.body.username && user.login.password == request.body.password;
          });
          if (user) {
          // Reset our counter of failed logins
          failedLoginAttempts[request.body.username] = 0;
        // Write the header because we know we will be returning successful at this point and that the response will be json
        response.writeHead(200, {'Content-Type': 'application/json'});
    
        // We have a successful login, if we already have an existing access token, use that
        let currentAccessToken = accessTokens.find((tokenObject) => {
          return tokenObject.username == user.login.username;
        });
    
        // Update the last updated value so we get another time period
        if (currentAccessToken) {
          currentAccessToken.lastUpdated = new Date();
          response.end(JSON.stringify(currentAccessToken.token));
        } else {
          // Create a new token with the user value and a "random" token
          let newAccessToken = {
            username: user.login.username,
            lastUpdated: new Date(),
            token: uid(16)
          }
          accessTokens.push(newAccessToken);
          response.end(JSON.stringify(newAccessToken.token));
        }
      } else {
         // When a login fails, tell the client in a generic way that either the username or password was wrong
        let numFailedForUser = failedLoginAttempts[request.body.username];
        if (numFailedForUser) {
          failedLoginAttempts[request.body.username]++;
        } else {
          failedLoginAttempts[request.body.username] = 0
        }
        response.writeHead(401, "Invalid username or password");
        response.end();
      }
    } else {
      // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
      response.writeHead(400, "Incorrectly formatted response");
      response.end();
    }
}}) 

// Only logged in users can access a shopping cart
myRouter.get('/api/me/cart', function(request,response) {
    response.end();
});
    
// Only logged in users can update a shopping cart
myRouter.post('/api/me/cart', function(request,response) {
    response.end();
});

// Only logged in users can update a shopping cart 
myRouter.delete('/api/me/cart/:productId', function(request,response) {
    cart.splice(cart[request.params.productId],1);
    response.end();
});

// Only logged in users can update a shopping cart
myRouter.post('/api/me/cart/:productId', function(request,response) {
    cart[request.params.productId].push(request.body); 
    response.end();
});
  