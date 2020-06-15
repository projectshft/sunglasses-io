var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;


const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

let brands = [];
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
    
  });

  

  //GET RETURNS ALL BRANDS
  //localhost:3001/api/brands
  //No requirements
  //returns all brands
  router.get("/api/brands", (request, response) => {
    //is there no need for a query since they are all being returned?
    if (!brands) {
      response.writeHead(404, "There are no brands to return");
      return response.end();
    } else 
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(brands));
    });

  //GET PRODUCTS BY BRAND ID
  //localhost:3001/api/brands/1/products
  //requires correct/existing brand Id in url
  //returns a list of products with the same brand ID
  router.get("/api/brands/:id/products", (request, response) => {
    const { id } = request.params;
    let productList = products.filter(product => product.categoryId.includes(id));
    const numId = parseInt(id, 10)
      
    if (!productList) { 
      response.writeHead(404, "No products can be found");
      return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productList));
  });

  //GET PRODUCTS BY SEARCH
  //localhost:3001/api/products?query=sweetest
  //requires query with search term in url
  //returns products that include query string in description
  router.get("/api/products", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl); //parse the url to get the query
    const { query } = queryString.parse(parsedUrl.query);
    let productsToReturn = [];

    if (query) {//if the query is defined, filter the products by query and assign them to productsToReturn
      productsToReturn = products.filter(product => product.description.includes(query));

      //if (!productsToReturn) 
      if (!productsToReturn) {//if the query is defined but there are no goals to return, 404 error || I tried to use (!productsToReturn) but this didn't work
        response.writeHead(404, "There are no products to return");
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

//From Auth assignment
//POST USER LOGIN WITH USERNAME AND PASSWORD
//localhost:3001/api/login
//Requires a valid username and password
//Returns an accessToken
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
        return response.end(JSON.stringify(newAccessToken.token,));
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
 
// GET USER CART FOR LOGGED IN USER
//localhost:3001/api/me/cart?accessToken=
//requires a valid token in URL to confirm valid user
//returns users cart
router.get('/api/me/cart', function(request,response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to be logged in to access your cart");
    return response.end();
  } 
    //Select the active user
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    //return the user's cart
    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(user.cart));

});

//ADD TO PRODUCT TO CART FOR LOGGED IN USER
//localhost:3001/api/me/cart?accessToken=
//requires a valid token in URL to confirm valid user
//requires a valid product id in request body to add to cart
//returns users cart
router.post('/api/me/cart', function(request,response) {
  // Make sure there is an accessToken and a productId in the request body
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to be logged in to access your cart");
    return response.end();
  } 
  //if there is no product ID in the request body, don't continue
  if (!request.body.productId){
    response.writeHead(404, "That product cannot be found");
    return response.end();
  } 
  
  else {
    //Select the active user
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });

    //select the current users cart
    let cart = user.cart

    //select the product in the body
    let product = products.find((product) => {
      return product.id == request.body.productId
    })

    //add quantity key/value
    let quantity = {quantity: 1}
    Object.assign(product, quantity)

    //Push selected product to user cart
    cart.push(product)

    //return the user's cart
    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(cart));
  }
});

//DELETE AN ITEM IN THE USER CART
//localhost:3001/api/me/cart/1?accessToken=
//requires a valid token in URL to confirm valid user
//requires a valid product id in url
//returns users cart (empty or with less items)

router.delete('/api/me/cart/:productId', function(request,response) {
  const { productId } = request.params;

  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to be logged in to view your cart");
    return response.end();
  }
  if (!productId){
    response.writeHead(404, "No item to delete");
    return response.end();
  } else {
    //Select the active user
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });

    //find the index of the item to be removed and splice it, as this needs to change the user's cart array instead of creating a new array (filter)
    item = user.cart.find(product => product.id == productId)
    // cart = user.cart.filter(product => product.id !== productId)
    let cart = user.cart
    let index = cart.indexOf(item)
    cart.splice(index, 1)
    

    //return the user's cart
    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(cart));
  }
});

//POST EDIT QUANTITY OF ITEM IN CART
//localhost:3001/api/me/cart/1?accessToken=
//requires a valid token in URL to confirm valid user
//requires a valid product id in url
//requires a number to update product quantity in request body
//returns users cart with updated quanity info for specific item 
router.post('/api/me/cart/:productId', function(request,response) {
  const { productId } = request.params;

  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't a valid access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to be logged in to edit your cart");
    return response.end();
  }
  if (!productId){
    response.writeHead(404, "That product cannot be found");
    return response.end();
  } else {
    //Select the active user
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });

    //Select item to be edited from cart, and change quanity to request body
    let item = user.cart.find(product => product.id == productId)

    if (!request.body.quantity){
      response.writeHead(401, 'Select a qunatity to update your cart item');
      return response.end();
    } else {

      item['quantity']= request.body.quantity
    
      //return the user's cart when all if statements pass
      response.writeHead(200, {'Content-Type': 'application/json'});
      return response.end(JSON.stringify(user.cart));
   }
  }
});


module.exports = server
