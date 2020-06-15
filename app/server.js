const http = require('http');
const fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const Brands = require('./modules/brands-module');
const Products = require('./modules/products-module');
const UserCart = require('./modules/cart-module');
const path = require("path");


const PORT = 3001;
//const VALID_API_KEYS = ["88312679-04c9-4351-85ce-3ed75293b449", "1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7"];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

// State holding variables that will populate from our json files when we start the server
let users = [];
let brands = [];
let products = [];

/* this array will hold our access token objects that will look like:
{
  username: string
  lastUpdated: date
  token: string
}
*/
let accessTokens = [];
//this will be our variable to store number of login attempts to prevent brute force attacks
let failedLoginAttempts = {};

//setup the router
const myRouter = Router();
myRouter.use(bodyParser.json());

//added this to get the request.body when using postman
myRouter.use(bodyParser.urlencoded({
  extended: true
}));

//assign server to a variable for export and start it up
const server = http.createServer(function (request, response) {
  // Verify that a valid API Key exists before we let anyone access our API
  // if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
  //   response.writeHead(401, "You need to have a valid API key to use this API");
  //   return response.end();
  // }
  response.writeHead(200);
  myRouter(request, response, finalHandler(request, response))

}).listen(PORT, error => {
  if (error) throw error;
  console.log(`Server is listening on ${PORT}`);

  //uncomment these 3 parse methods when using postman, eg, readFileSync is reading the path from where it's invoked so these won't work for mocha tests (so comment out when running tests)
  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
  products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));
  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));


  //uncomment these 3 methods when running mocha tests (and comment out when using postman)
  // brands = JSON.parse(fs.readFileSync("../initial-data/brands.json", "utf-8"));
  // products = JSON.parse(fs.readFileSync("../initial-data/products.json", "utf-8"));
  // users = JSON.parse(fs.readFileSync("../initial-data/users.json", "utf-8"));
});
// const file = fs.readFileSync(path.resolve(__dirname, "../file.xml"))

// this function will permanently update our user data
const saveCurrentUser = (currentUser) => {
  // find the index of the current user in the users array, and replace that user with their updated data
  let indexOfUser = users.findIndex(user => user.login.username == currentUser.login.username)
  users[indexOfUser] = currentUser;

  //these writeFileSyncs will permanently update our 'db'(users.json)
  //uncomment when using postman (and comment out when using mocha)
  fs.writeFileSync("./initial-data/users.json", JSON.stringify(users), "utf-8");

  //uncomment when testing with mocha (and comment out when using postman)
  // fs.writeFileSync("../initial-data/users.json", JSON.stringify(users), "utf-8");
}

//Handle get request to return all available brands
myRouter.get('/api/brands', function (request, response) {
  if (brands.length) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(Brands.getAllBrands(brands)));
  } else {
    response.writeHead(404)
    return response.end("Brands not available")
  }
})

//Handle get request to return all available products
myRouter.get('/api/products', function (request, response) {
  const parsedUrl = require('url').parse(request.url, true);

  //this will check if there is a query in the request url. If so, we will check our brands and products data to find any matches (eg, user could enter 'oakley' or 'best' and get results)
  if (parsedUrl.query.searchString) {
    const idOfSearchedBrand = Brands.getIdOfSearchedBrand(parsedUrl.query.searchString, brands);

    const foundProducts = Products.searchProductsByQuery(parsedUrl.query.searchString, idOfSearchedBrand, products);

    if (foundProducts.length === 0) {
      response.writeHead(404);
      return response.end("No products found");
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(foundProducts));

  } else {

    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(Products.getAllProducts(products)));
  }
})


//Handle get request to return all available products of a particular brand (by brand id)
myRouter.get('/api/brands/:id/products', function (request, response) {

  //First get the brand id from the request
  const selectedBrandId = request.params.id;

  //If brand id was not provided in the query, return error
  if (selectedBrandId == 'null') {
    response.writeHead(400);
    return response.end("Unable to complete request")
  }

 //find products by the given brand id 
 const foundProductsArray = Products.getProductsByBrandId(selectedBrandId, products) 

 // If there are no brands matching the brand Id from the query, return error
  if (foundProductsArray.length === 0) {
    response.writeHead(404);
    return response.end("No products found");
  }

  // Return the available products available for the particular brand id
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(foundProductsArray));
})


// Helpers to get/set our number of failed requests per username
var getNumberOfFailedLoginRequestsForUsername = function (username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
}

var setNumberOfFailedLoginRequestsForUsername = function (username, numFails) {
  failedLoginAttempts[username] = numFails;
}

var getValidTokenFromRequest = function (request) {
  var parsedUrl = require('url').parse(request.url, true)
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

//Handle post request to login the user
myRouter.post('/api/login', function (request, response) {

  // Make sure there is a username and password in the request and check for multiple failed login attempts (to prevent brute force attacks)
  if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
    // See if there is a user that has that username and password
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });

    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumberOfFailedLoginRequestsForUsername(request.body.username, 0);

      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, { 'Content-Type': 'application/json' });

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update the last updated value so we get another time period before expiration
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


//Handle request to return all the products in a user's cart
myRouter.get('/api/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to continue");
    return response.end();
  }
  // Check if the current user has access to the cart
  let user = users.find((user) => {
    return user.login.username == currentAccessToken.username;
  });


  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(UserCart.getEntireCart(user)));
})


//Handle request to add a product to the cart, added product will be returned in the response
myRouter.post('/api/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to continue");
    return response.end();
  }

  // Check if the current user has access 
  let user = users.find((user) => {
    return user.login.username == currentAccessToken.username;
  });

  //If product doesn't have an id, return an error
  if (!request.body.id) {
    response.writeHead(400);
    return response.end("Cannot add product to cart");
  }

  //Find the product by id
  const productToAdd = Products.findProductById(products, request.body.id)

  //Add item to cart and assign a variable the updated cart, so we can send it in the response 
  const updatedUser = UserCart.addProduct(productToAdd, user);

  //save updated user permanently and return the added product
  response.writeHead(200, { "Content-Type": "application/json" });
  saveCurrentUser(updatedUser);
  return response.end(JSON.stringify(productToAdd));
});


//Handle request for testing if a product is successfully removed from the cart
myRouter.get('/api/me/cart/:productId', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  }

  // Check if the current user has access to the store
  let user = users.find((user) => {
    return user.login.username == currentAccessToken.username;
  });

  const productInCart = UserCart.findProductInCart(request.params.productId, user);

  if (productInCart) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productInCart));

  } else {
    response.writeHead(404);
    return response.end("Item is not in the cart");
  }
})



//Handle request for removing a product from the user's cart by its id (parameter)
myRouter.delete('/api/me/cart/:productId', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to continue");
    return response.end();
  }

  // Check if the current user has access 
  let user = users.find((user) => {
    return user.login.username == currentAccessToken.username;
  });

  // Check if product is in cart
  const foundProduct = UserCart.findProductInCart(request.params.productId, user);

  // If product is not in the cart, return an error
  if (!foundProduct) {
    response.writeHead(404);
    return response.end("Product not found");
  }

  // At this point, we know the product is in the cart and we can now remove it
  const updatedCart = UserCart.deleteProduct(request.params.productId, user);

  // Return success code for removing the product, and return updated cart
  response.writeHead(200);
  saveCurrentUser(user);
  return response.end(JSON.stringify(updatedCart));
})


// Handle post request to change quantity of item in cart
myRouter.post('/api/me/cart/:productId', function (request, response) {

  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to continue");
    return response.end();
  }

  // Check if the current user has access
  let user = users.find((user) => {
    return user.login.username == currentAccessToken.username;
  });

  // Check if product is in cart
  const foundProduct = UserCart.findProductInCart(request.params.productId, user);

  // If product is not in the cart, return an error
  if (!foundProduct) {
    response.writeHead(404);
    return response.end("Product not found");
  }

  // At this point, we know the product is in the cart and we can now update the quantity
  const updatedCart = UserCart.changeQuantityOfProduct(request.params.productId, request.body.newQuantity, user)

  // Return success code for updating the product, save users updated cart and return updated cart
  response.writeHead(200, { "Content-Type": "application/json" });
  saveCurrentUser(user);
  return response.end(JSON.stringify(updatedCart));
})

module.exports = server;