var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
var newAccessToken = uid(16);
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

const PORT = 3001;

// State holding variables
let brands = [];
let products = [];
let users = [];
var accessTokens = [];
var failedLoginAttempts = {};

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
  });

myRouter.get('/api/brands', function(request,response) {
    if (brands.length == 0 ) {
     response.writeHead(404, "Sorry we couldn't find any brands")
     return response.end()
    } else {
     response.writeHead(200, { "Content-Type": "application/json" });
     return response.end(JSON.stringify(brands));
    }
});

myRouter.get('/api/brands/:id/products', function(request,response) {
  //productslist returns a list of products that have the same category id as the brand id passed through the parameters
  let productsList = products.filter((product) => {
      return product.categoryId == request.params.id
    })
  let brandList = brands.filter((brand) => {
      return brand.id == request.params.id 
    })

    if(isNaN(request.params.id)) {
      response.writeHead(400, "Brand id is invalid")
      return response.end()
    } else if (brandList.length == 0) {
      response.writeHead(404, "This brand does not exist")
      return response.end()
    } else if (productsList.length == 0) {
      response.writeHead(404, "This brand currently has no products")
      return response.end()
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(productsList));
    }
})

myRouter.get('/api/products', function(request,response) {
  if (products.length == 0 ) {
    response.writeHead(404, "Sorry we couldn't find any products")
    return response.end()
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(products));
  }
});

myRouter.post('/api/login', function(request,response) {
    if(request.body.username == '' || request.body.password  == '') {
      response.writeHead(400, "Username and password are required")
      return response.end()

    } else if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
    // Make sure there is a username and password in the request
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
    let token = request.body.token
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

  myRouter.get('/api/me/cart', function(request,response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      response.writeHead(401, "You need to have access to this call to continue",);
      return response.end();
    } else {
       let user =  users.find((user)=>{
        return user.login.username == currentAccessToken.username
       })
       
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
    }
});

myRouter.post('/api/me/cart', function(request,response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      response.writeHead(401, "You need to have access to this call to continue",);
      return response.end();
    } else {
       let user =  users.find((user)=>{
        return user.login.username == currentAccessToken.username
       })

       let product = request.body.product;
       product['quantity'] = 1;

        let foundProduct = products.filter((p)=> {
          return p.id == product.id
        })

        let repeatProduct = user.cart.find((p)=> {
          return p.id == product.id
        })

           if (foundProduct.length == 0) {
            response.writeHead(404, "This product doesn't exist");
            return response.end();
          } else if (repeatProduct) {
            response.writeHead(404, "Product is already in cart")
            return response.end()
          } else {
            user.cart.push(product);
            response.writeHead(200, { "Content-Type": "application/json" });
            return response.end(JSON.stringify(user.cart));
        }
    }
});

myRouter.delete('/api/me/cart/:productId', function(request,response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
      response.writeHead(401, "You need to have access to this call to continue",);
      return response.end();
    } else {

       let user =  users.find((user)=>{
        return user.login.username == currentAccessToken.username
       })

       let cart = user.cart.filter(function(p) {
            return p.id !== request.params.productId
        })

        user.cart = cart 

       response.writeHead(200, { "Content-Type": "application/json" });
       return response.end(JSON.stringify(user.cart));
    }
});

myRouter.put('/api/me/cart/:productId', function(request,response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue",);
    return response.end();
  } else {

     let user =  users.find((user)=>{
      return user.login.username == currentAccessToken.username
     })
     
     let cart = user.cart.map((p)=>{
        if(p.id == request.params.productId) {
           p.quantity++
        }
        return p 
      })
      
      user.cart = cart

     response.writeHead(200, { "Content-Type": "application/json" });
     return response.end(JSON.stringify(user.cart));

  }
});

myRouter.get('/api/search', function(request,response) {
  let query = request._parsedUrl.query.slice(2)

  let queryResults = products.filter(function(p) {
    return p.name.includes(query) || p.description.includes(query)
  })
  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(queryResults));
})

module.exports = server