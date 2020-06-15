var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

var myRouter = Router();
myRouter.use(bodyParser.json());

//arrays to hold brands, products, and users after they are read from the json file
var brands = [];
var products = [];
var users = [];

//array to hold access tokens graned from a user login
var accessTokens = [];

// object to hold failed login attempts for a user
var failedLoginAttempts = {};

//amount of time until an access token expires
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  //reading files and adding brands, products, and users from JSON into arrays
  fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

myRouter.post('/api/login', function (request, response) {
  // verifying that username and password exist and that a user hasn't incorrectly attempted to login more than 3 times
  if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
    // See if there is a user that has that username and password
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      // if a user can log in, reset their failed login attempts to 0
      setNumberOfFailedLoginRequestsForUsername(request.body.username, 0);
      response.writeHead(200, { "Content-Type": "application/json" });
      // check to see if there is already an access token for that user
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // update the user's access token to allow 15 more minutes of access
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // if there isn't already an access token for that user, create one
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        //add new access token to the access tokens array
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // Update the number of failed login attempts
      let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
      setNumberOfFailedLoginRequestsForUsername(request.body.username, ++numFailedForUser);
      //username or password is incorrect
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    // username or password is missing
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

//gets number of failed login attempts from failedLoginAttemps object
var getNumberOfFailedLoginRequestsForUsername = function (username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
}

// set number of failed login attemps after a failed login
var setNumberOfFailedLoginRequestsForUsername = function (username, numFails) {
  failedLoginAttempts[username] = numFails;
}

// Helper method to process access token
var getValidTokenFromRequest = function (request) {
  var parsedUrl = require('url').parse(request.url, true)
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it is valid and not expired
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

// gets an array of brands
myRouter.get('/api/brands', function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

// gets an array of all products
myRouter.get('/api/products', function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
})

// ges an array of products orm a specified brand
myRouter.get('/api/brands/:brandId/products', function (request, response) {
  //if brand id is invalid, return a 400 error
  if (!request.params.brandId || request.params.brandId === "null" || request.params.brandId === "undefined") {
    response.writeHead(400, "Invalid BrandId Supplied");
    response.end();
    // if brand id does not exist, return a 404 error
  } else if (!products.find(product => product.categoryId === request.params.brandId)) {
    response.writeHead(404, "Brand not found");
    response.end();
  } else {
    //successful response
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(products.filter(product => product.categoryId === request.params.brandId)));
  }
})

// get an array of products from the user's cart
myRouter.get('/api/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  //check if their is an access token from the user (true if they are logged in)
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    response.end();
  } else {
    let user = users.find(user => user.login.username === currentAccessToken.username);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }

})

// POST an item to a user's cart
myRouter.post('/api/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  //check if their is an access token from the user (true if they are logged in)
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    response.end();
    // if product object is empty or doesn't exist, return a 400 error
  } else if (!request.body || Object.keys(request.body).length === 0) {
    response.writeHead(400, "Invalid product supplied");
    response.end();
  } else {
    // find the user that is logged in
    let user = users.find(user => user.login.username === currentAccessToken.username);
    let product = request.body;
    // add the product to the users cart
    user.cart.push(product);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }

})

// deletes a product from a user's cart
myRouter.delete('/api/me/cart/:productId', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  //check if their is an access token from the user (true if they are logged in)
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    response.end();
    // if product id is invalid, return a 400 error
  } else if (!request.params.productId || request.params.productId === 'null' || request.params.productId === "undefined") {
    response.writeHead(400, "invalid product id supplied");
    response.end();
    // if no product with that id exists, return a 404 error
  } else if (!products.find(product => product.id === request.params.productId)) {
    response.writeHead(404, "product not found");
    response.end();
  } else {
    // get the current lgged in user
    let user = users.find(user => user.login.username === currentAccessToken.username);
    let productId = request.params.productId;
    // filter out the items to be removed from the cart
    user.cart = user.cart.filter(products => products.id !== productId);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end();
  }
})

// updates the quantity of an item in the user's cart
myRouter.post('/api/me/cart/:productId', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  //check if their is an access token from the user (true if they are logged in)
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    response.end();
    // if the supplied quantity is invalid, return a 400 error
  } else if (!request.body.quantity || request.body.quantity === "null" || request.body.quantity === "undefined" || request.body.quantity <= 0) {
    response.writeHead(400, "invalid quantity supplied")
    response.end();
    // if there is no product with that id, return a 404 errorß
  } else if (!products.find(product => request.params.productId === product.id)) {
    response.writeHead(404, "invalid product id supplied")
    response.end();
  } else {
    let user = users.find(user => user.login.username === currentAccessToken.username);
    let productId = request.params.productId;
    let quantity = request.body.quantity;
    let productToUpdate = user.cart.find(product => product.id === productId);
    for (let i = 0; i < quantity; i++) {
      user.cart.push(productToUpdate);
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
})


module.exports = server;