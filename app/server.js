var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

//api key storage
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 10000;

//state-holding variables, cart is kept inside currentUser via /POST /api/me/cart
let brands = [];
let products = [];
let users = [];
let currentUser = {};
let accessTokens = [];
let failedLoginAttempts = {};

//Setup for the router
let myRouter = Router();
myRouter.use(bodyParser.json());

//Setup for server
let server = http.createServer(function (request, response) {
  if(!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
    response.writeHead(401, "You need to have a valid API key to use this API")
  }
  response.writeHead(200);
    myRouter(request, response, finalHandler(request, response))
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port port ${PORT}`);
  //populate brands
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
})
//GET all brands
myRouter.get("/api/brands", function(request,response) {
  if(!request) {
    return console.log('request not defined')
  }
  let brandsToReturn = [];
  brandsToReturn = brands;
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
})

//GET all products of a single brand (by categoryId)
myRouter.get("/api/brands/:id/products", (request, response) =>{
  const { id } = request.params;
  const category = brands.find(category => category.id == id);
  if (!category) {
    response.writeHead(404, "That brand does not exist");
    return response.end()
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedProducts = products.filter(
    products => products.categoryId === id
  )
  return response.end(JSON.stringify(relatedProducts));
})
//GET all products
myRouter.get("/api/products", function(request,response) {
  if(!request) {
    return console.log('request not defined')
  }
  let productsToReturn = [];
  productsToReturn = products;
  // console.log('products to return', productsToReturn);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
})

//Functions to help manage failed requests by username
let getNumFailedLoginRequestsForUsername = (username) => {
  let currentNumFailedRequests = failedLoginAttempts[username];
  if(currentNumFailedRequests) {
    return currentNumFailedRequests;
  }
  return 0;
}
let setNumFailedLoginRequestsForUsername = (username, numFails) => {
  failedLoginAttempts[username] = numFails;
}

//Function to set the current user
let setCurrentUser = (user) => {
  currentUser = user;
}

//User Login request
myRouter.post('/api/login', (request, response) =>{
  if(request.body.username && request.body.password && getNumFailedLoginRequestsForUsername(request.body.username) < 3) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    })
    setCurrentUser(user);
    if(user) {
      setNumFailedLoginRequestsForUsername(request.body.username, 0);
      response.writeHead(200, 'login successful');
      let currentAccessToken = accessTokens.find((tokenObj) => {
        return tokenObj.username == user.login.username;
      })
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      }
      //Create new access token if one doesn't already exist
      let newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16)
      }
      accessTokens.push(newAccessToken);
      return response.end(JSON.stringify(newAccessToken.token));
    }
    let numFailsForUser = getNumFailedLoginRequestsForUsername(request.body.username);
    setNumFailedLoginRequestsForUsername(request.body.username, ++numFailsForUser);
    response.writeHead(401, 'invalid username or password');
    return response.end();
  }
  response.writeHead(400, "incorrectly formatted response");
  return response.end();
});
//function to return the access token for requests that require user authorization
let getValidTokenFromRequest = () => {
  let currentAccessToken = accessTokens.find((accessToken) => {
    return accessToken.username == currentUser.login.username && ((new Date) - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT);
  });
  if(currentAccessToken) {
    return currentAccessToken;
  }
  return null;
}

myRouter.post("/api/me/cart", (request, response) =>{
  let currentAccessToken = getValidTokenFromRequest();
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to proceed with this call");
    return response.end();
  }
  let productToAdd = products.find((product) => {
    return product.id == request.body.id
  })
  //User should only be able to add to their own cart
  if(currentUser.login.username == currentAccessToken.username){
    let productDataAlreadyInCart = currentUser.cart.find((productData) => {
      return productData.product.id == request.body.id;
    })
    if(productDataAlreadyInCart) {
      //this will just increase the quantity property for the cart data object containing the product object with the matching productId from the request params
      ++productDataAlreadyInCart.quantity;
      response.writeHead(200, 'additional unit added to cart');
      return response.end();
    }
    currentUser.cart
    .push({product: productToAdd, quantity: 1});
    response.writeHead(200, 'add to cart successful');
    return response.end();
  }
  response.writeHead(401, 'add to cart unsuccessful: invalide access token');
  return response.end();
})
//get current user's cart
myRouter.get('/api/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest();
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to proceed with this call");
    console.log(response);
    return response.end();
  }
  let cartToReturn = [];
  cartToReturn = currentUser.cart;
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cartToReturn));  
})
//Current user can delete a product from their cart based on productId
myRouter.delete('/api/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest();
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to proceed with this call");
    console.log(response);
    return response.end();
  }
  //Current user should be able to delete products from only their cart
  if(currentUser.login.username == currentAccessToken.username){
    //filtering the cart array to remove any element with a product id maching the id from params
    currentUser.cart = currentUser.cart.filter(product => product.product.id !== request.params.productId);
    response.writeHead(200, 'deletion successful');
    return response.end();
  }
  response.writeHead(404, 'product does not exist in cart');
  return response.end();
})
//Change quantity of item
myRouter.post('/api/me/cart/:productId', (request,response) => {
  let currentAccessToken = getValidTokenFromRequest();
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to proceed with this call");
    return response.end();
  }

  //User should only be able to modify quantities in their own cart
  if(currentUser.login.username == currentAccessToken.username) {
    let productDataAlreadyInCart = currentUser.cart.find((productData) => {
      return productData.product.id == request.params.productId;
    })
    //gets the index of the productData element inside the cart array that has the same productId as the request params
    let indexOfItemToChangeQuantity = currentUser.cart.findIndex((productData) => productData.product.id == request.params.productId)
    //setting the quantity of the product in the cart equal to the user-input quantity from request body
    currentUser.cart[indexOfItemToChangeQuantity].quantity = request.body.quantity;
    
    response.writeHead(200, 'Quantity updated successfully');
    return response.end();
  }
  response.writeHead(401,'Quantity not updated: invalid access');
  return response.end();
})

module.exports = server;
