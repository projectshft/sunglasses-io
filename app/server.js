var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

//api key storage
const VALID_API_KEYS = ["98738203-8dsj-0983-9f72-di29dk38djk3", "8di3k99l-5305-8dk3-1849-zjdf938jfj98"];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 10000;


let brands = [];
let products = [];
let users = [];
let currentUser = {};
let accessTokens = [];
let failedLoginAttempts = {};
//Cart is property of each user in JSON file


//Setup for the router
let myRouter = Router();
myRouter.use(bodyParser.json());
//Setup for server
let server = http.createServer(function (request, response) {


  if(!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
    response.writeHead(401, "You need to have a valid API key to use this API")
  }
  // console.log(request.headers);
  
  response.writeHead(200);

    myRouter(request, response, finalHandler(request, response))
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port port ${PORT}`);
  //populate brands
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  // console.log(brands);
  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  // console.log(products);
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
  // console.log('brands to return', brandsToReturn);
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
  // console.log(relatedProducts);
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
  // console.log(request.body)
  if(request.body.username && request.body.password && getNumFailedLoginRequestsForUsername(request.body.username) < 3) {
    // console.log(request.body.username, ' --- ',request.body.password)
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    })
    setCurrentUser(user);
    // console.log(currentUser);
    if(user) {
      setNumFailedLoginRequestsForUsername(request.body.username, 0);
      response.writeHead(200, 'login successful');
      // console.log(user);
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
      // console.log(accessTokens[0].token);
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
    currentUser.cart.push(productToAdd);
    // console.log(currentUser.cart);
    response.writeHead(200, 'add to cart successful');
    return response.end();
  }
  response.writeHead(401, 'add to cart unsuccessful: invalide access token');
  return response.end();
})
//get current user's cart
myRouter.get('/api/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest();
  // console.log(currentAccessToken);
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to proceed with this call");
    console.log(response);
    return response.end();
  }
  let cartToReturn = [];
  cartToReturn = currentUser.cart;
  // console.log(currentUser.cart);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cartToReturn));  
})
myRouter.delete('/api/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest();
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to proceed with this call");
    console.log(response);
    return response.end();
  }
  const { idToRemove } = request.params.productId;
  //Current user should be able to delete products from only their cart
  if(currentUser.login.username == currentAccessToken.username){
    // console.log('cart before deletion', currentUser.cart);
    currentUser.cart = currentUser.cart.filter(product => product.id !== request.params.productId);
    // console.log('cart after deletion: ', currentUser.cart);
    response.writeHead(200, 'deletion successful');
    
    return response.end();
  }
  response.writeHead(404, 'product does not exist in cart');
  return response.end();

})

module.exports = server;
