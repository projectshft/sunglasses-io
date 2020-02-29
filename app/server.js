var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const newAccessToken = uid(16);
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
let failedLoginAttempts = {};
let accessTokens = []

const PORT = 3001;

let brands = [];
let products = [];
let users = [];
let user = {};

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
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
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
    fs.readFile("initial-data/users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      user = users[1];
      console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
  });
  //brands router
  myRouter.get('/api/brands', function(request,response) {
    if(request.body.length === 0) {
      response.writeHead(404);	
      return response.end("Brands array is empty");
    }
    response.writeHead(200, {'Content-Type': 'application/json'});
    // Return all brands definitions (for now)
    return response.end(JSON.stringify(brands));
  });
  //products router by brand id
  myRouter.get('/api/brands/:id/products', function(request,response) {
    const foundProducts = products.filter(product => {
        return product.categoryId == request.params.id
    })
    // Return 404 if not found
	if (foundProducts.length === 0) {
		response.writeHead(404);	
		return response.end("Brand Not Found");
	}

    response.writeHead(200, {'Content-Type': 'application/json'});
    // Return all products definitions (for now)
    return response.end(JSON.stringify(foundProducts));
  });
  //products router
  myRouter.get('/api/products', function(request,response) {
    
    if(request.body.length === 0) {
      response.writeHead(404);	
      return response.end("Products array is empty");
    }

    response.writeHead(200, {'Content-Type': 'application/json'});
    // Return all products definitions (for now)
    return response.end(JSON.stringify(products));
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
  // Login call
  myRouter.post('/api/login', function(request,response) {

    // Make sure there is a username and password in the request
    if (request.body.username && request.body.password ) {
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

        // // Update the last updated value so we get another time period
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
        //return response.end(JSON.stringify(user));
      } else {
        // Update the number of failed login attempts
        let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
        setNumberOfFailedLoginRequestsForUsername(request.body.username,++numFailedForUser);
        // When a login fails, tell the client in a generic way that either the username or password was wrong
        response.writeHead(401, {'Content-Type': 'application/json'}, "Invalid username or password");
        return response.end();
      }

    } else {
      // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
      response.writeHead(400, {'Content-Type': 'application/json'},"Incorrectly formatted response");
      return response.end();
    }
  });
  //get all products in the cart
  myRouter.get('/api/me/cart', function(request,response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
      response.writeHead(401, "You need to have access to this call to continue");
      return response.end();
    } else {
      // Return whats in the cart
      if(!request.body) {
        response.writeHead(404);	
        return response.end("Cart is empty");
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
    }
  });
  //add product to the cart
  myRouter.post('/api/me/cart', function(request,response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
      response.writeHead(401, "You need to have access to this call to continue");
      return response.end();
    } else {
      // Add items to the cart
      if(!request.body.product.price) {
        // Return error 
        response.writeHead(500);	
        return response.end("Product Has to have price");
      }

      if(!request.body) {
        // Return error 
        response.writeHead(404);	
        return response.end("Nothing to post");
      }

      if(request.body.quantity < 0 || typeof request.body.quantity != 'number') {
        response.writeHead(404);	
        return response.end("Invalid quantity");
      }

      if(user.cart.length > 0) {
        //if the product id is in the cart, increment quantity of that product
        user.cart.forEach((item) => {
          if(item.product.id == request.body.product.id) {
            item.quantity++
          }
          else {
            user.cart.push(request.body)
          }
        })
      }
      else {
        //if not the same product, add new product to the cart
        user.cart.push(request.body); 
      }
      // Return success with added book
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
    }
  });
  //update product properties of given id in the cart
  myRouter.post('/api/me/cart/:productId', function(request,response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
      response.writeHead(401, "You need to have access to this call to continue");
      return response.end();
    } else {
      if(!request.body) {
        // Return error 
        response.writeHead(404);	
        return response.end("Nothing to update");
      }

      //Find index of the product we need to update using findIndex method.    
      let itemIndex = user.cart.findIndex((obj) => {
        return obj.product.id == request.body.product.id});

      //Update propeties of the product send to update
      user.cart[itemIndex].categoryId = request.body.product.categoryId
      user.cart[itemIndex].name = request.body.product.name
      user.cart[itemIndex].description = request.body.product.description
      user.cart[itemIndex].price = request.body.product.price
      user.cart[itemIndex].imageUrls = request.body.product.imageUrls
    }
      // Return success with added book
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
  });
  //delete product of given id from the cart
  myRouter.delete('/api/me/cart/:productId', function(request,response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
      response.writeHead(401, "You need to have access to this call to continue");
      return response.end();
    } else {
      if(!request.body) {
        // Return error 
        response.writeHead(404);	
        return response.end("Nothing to delete");
      }

      //Find index of the product we need to delete using findIndex method.    
      let itemIndex = user.cart.findIndex((obj) => {
        return obj.product.id == request.body.product.id});

      user.cart.forEach((item) => {
        //if need to delete a product with quntity grater than 1
        //decrement product quantity
        if(item.product.id == request.body.product.id && item.quantity > 1) {
          item.quantity--
        }
        else if(item.product.id == request.body.product.id && item.quantity === 1) {
          //remove product from the cart
          user.cart.splice(itemIndex, 1);
        }
      })
    }
      // Return success with added book
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
  });

  module.exports = server