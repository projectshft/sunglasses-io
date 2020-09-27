var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const TOKEN_VALIDITY_TIMEOUT = 900000 // 15 minutes
const PORT = 3001;
// states
brands = [];
products = [];
users = [];
let cart;
var accessTokens = [{
  username: 'backdoor',
  lastUpdated: Date.now(),
  token: 'pjrules'
}];
//var failedLoginAttempts = {};  

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());
// Helper method to process access token
var getValidTokenFromRequest = function (request) {
  var parsedUrl = require('url').parse(request.url, true)
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure its valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken //&& ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
    });
    if (currentAccessToken) {
      console.log('token was found valid');
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

let server = http.createServer(function (request, response) {
  //before any REST requests, validation could happen here



  // 
  //route commands to myRouter
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  // load data upon verifing server is a go 
  // load Brands data
  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} Brands loaded`);
  });

  // load Products data
  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} Products loaded`);
  });

  // load Users data
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} Users loaded`);
  });

  console.log(`Server ready on ${PORT}`);
});


// Routing starts

// Public route - no login required
// Brands
// -List of all brands
// -List first X brands in list with number query
myRouter.get('/api/brands', function (request, response) {
  response.writeHead(200, {
    "Content-Type": "application/json"
  });
  var parsedUrl = require('url').parse(request.url, true)
  if (parsedUrl.query.number) {
    return response.end(JSON.stringify(brands.slice(0, parsedUrl.query.number)));
  } else {
    return response.end(JSON.stringify(brands));
  }
});
// -Return all products of a specified brandId
myRouter.get('/api/brands/:brandId/products', function (request, response) {
  response.writeHead(200, {
    "Content-Type": "application/json"
  });
  // console.log('proper parsing test ', parsedUrl);
  // console.log('query test', request.params.brandId)
  if (request.params.brandId) {
    let niceResults = products.filter(item => item.categoryId === request.params.brandId);
    return response.end(JSON.stringify(niceResults));
  } else {
    // TODO return error
    return response.end(JSON.stringify(products));
  }
});
// Products
// -List all products
// -Return product search results with search params
myRouter.get('/api/products', function (request, response) {
  response.writeHead(200, {
    "Content-Type": "application/json"
  });
  var parsedUrl = require('url').parse(request.url, true)
  console.log('proper parsing test ', parsedUrl);
  if (parsedUrl.query.search) {
    let niceResults = products.filter(item => item.name === parsedUrl.query.search);
    // TODO make a robust search of some type
    return response.end(JSON.stringify(niceResults));
  } else {
    return response.end(JSON.stringify(products));
  }
});

// Login
// -Verify username and password, issue token
myRouter.post('/api/login', function (request, response) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.username && parsedUrl.query.password) {

    let user = users.find((user) => {
      return user.login.username == parsedUrl.query.username && user.login.password == parsedUrl.query.password;
    });
    if (user) {
      // TODO count failed logins

      // Write the header because as 200
      response.writeHead(200, {
        'Content-Type': 'application/json'
      });

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = Date.now();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a uid16 token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: Date.now(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // TODO error / track failed login attempts

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

// Cart -- login required
// -Verify valid token, then allow access
myRouter.get('/api/me/cart', function (request, response) {
  // check for token
  // else send login required error 401
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "Please log in to access your cart");
    return response.end();
  } else {
    // find cart contents
    response.writeHead(200, {
      "Content-Type": "application/json"
    });
    return response.end(cart ? JSON.stringify(cart) : JSON.stringify('Sorry, cart empty'));
  }
});


// -Add product to shopping cart
  // check for token
  // add product to cart (query prodId)
  // else send login required error 401
myRouter.post('/api/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "Please log in to add items to your cart");
    return response.end();
  } else {
    var parsedUrl = require('url').parse(request.url, true);
    // confirm query exists
    if (parsedUrl.query.prodId) {
      // confirm product id exists
      if (selectedProd = products.find(item => item.id === parsedUrl.query.prodId)) {
        if (!cart) { cart = [] };
         let totalProdsInCart = cart.push({
           item: selectedProd.id,
           name: selectedProd.name,
           price: selectedProd.price,
           quantity: 1
         }); // possible TODO check if already in cart, sum qty
        response.writeHead(200, `Product ID ${parsedUrl.query.prodId} added to cart. ${totalProdsInCart} items in cart.`);
        return response.end();
      } else {
        // invalid product
        response.writeHead(200, "Call succeeded, but product is invalid");
        return response.end();
      }
    };
  }
});

// -Update quantity of product in cart
  // parseUrl and params
  // check for token
  // check for existing product
  // increment product to cart
  // else send login required error 401
myRouter.post('/api/me/cart/:prodId', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  console.log(request);
  if (!currentAccessToken) {
    response.writeHead(401, "Please log in to modify items to your cart");
    return response.end();
  
  } else {
    
    var parsedUrl = require('url').parse(request.url, true);
    // confirm query exists
    if (request.params.prodId) {

      // confirm cart has item
      if ((selectedCartItem = cart.findIndex(item => item.item === request.params.prodId)) >= 0) { 
        cart[selectedCartItem].quantity = parsedUrl.query.quantity;
        response.writeHead(200, `Product ID ${request.params.prodId} has a new quantity of ${parsedUrl.query.quantity}.`);
        console.log('resulting cart', cart);
         return response.end();
       } else {
         // invalid product
         response.writeHead(400, "Call succeeded, but product is invalid");
         return response.end();
       };
       
      } else {
         // invalid cart
        response.writeHead(400, "Cart is empty or item not found in cart.");
        return response.end();
       }
      // confirm product id exists
      
    };
});

// -Delete product from cart
myRouter.delete('/me/cart/:prodId', function (request, response) {
  response.writeHead(418, {
    "Content-Type": "application/json"
  });
  // parseUrl and params
  // check for token
  // check for existing product
  // increment product to cart
  // else send login required error 401
});
module.exports = server;