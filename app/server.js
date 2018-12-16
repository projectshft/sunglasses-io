var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser  = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;
const { findProductOrBrand, findProductsByQueryTerms, getValidTokenFromRequest } = require("./utils");

// State holding variables
let brands = [];
let products = [];
let users = [];
let loggedInUser = {};
//hard-code first accessToken for testing purposes
let accessTokens = [{
  username: "susanna.richards@example.com",
  lastUpdated: new Date(),
  token: "abc123"
}];

const PORT = 3001;

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((request, response) => {
   response.writeHead(200);
   router(request, response, finalHandler(request, response));
});

server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);
    //populate brands
    brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));
    //populate products
    products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf8"));
    //populate users
    users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf8"));
    //hardcoded a logged in user
    loggedInUser = users[0];
});

//GET all brands from the store
router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

//GET all products by brand id from the store
router.get("/api/brands/:brandId/products", (request, response) => {
  const { brandId } = request.params;
  const brand = findProductOrBrand(brandId, brands);
  if (!brand) {
    response.writeHead(404, "That brand does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const brandProducts = products.filter(
    product => product.categoryId === brandId
  );
  return response.end(JSON.stringify(brandProducts));
});

//GET products from the store based on a query string
router.get('/api/products', (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let queryArray = [];
  let productsToReturn = [];
  if (query) {
    queryArray = query.split(' ');
  }
  
  //findProductsByQueryTerms is written in utils.js
  if (query !== undefined && query !== ""){
    productsToReturn = findProductsByQueryTerms(queryArray, products);
  } else {
    productsToReturn = products;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn))
});

//POST login
router.post('/api/login', function(request,response) {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password 
    let user = users.find((user)=>{
      return user.email == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      // Successful login. Search for existing access token for user.
      loggedInUser = user;
      response.writeHead(200, {'Content-Type': 'application/json'});
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.email;
      });
  
      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.email,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, "Invalid username or password");
      response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the request
    response.writeHead(400, "Incorrectly formatted request");
    response.end();
  }
});

//GET cart
router.get('/api/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request, accessTokens);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue");
    response.end();
  } else {
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify(loggedInUser.cart));
    }
});

//POST a product to the user's cart
router.post('/api/me/cart', function(request,response) {
  let currentAccessToken = getValidTokenFromRequest(request, accessTokens);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue");
    response.end();
  } else {
      const parsedUrl = url.parse(request.originalUrl);
      const { productId } = queryString.parse(parsedUrl.query);
      const productToAdd = findProductOrBrand(productId, products);
      if (!productToAdd) {
        response.writeHead(404, "Product not found");
        response.end();
      }
      let cartItemToAdd = {
        id: productToAdd.id,
        name: productToAdd.name,
        price: productToAdd.price,
        quantity: 1
      };
      const productIsInCart = findProductOrBrand(productId, loggedInUser.cart);

      if(!productIsInCart) {
       loggedInUser.cart.push(cartItemToAdd);
      }

      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify(cartItemToAdd));
    }
});

//DELETE a product from the user's cart
router.delete('/api/me/cart/:productId', function(request,response) {
  let currentAccessToken = getValidTokenFromRequest(request, accessTokens);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue");
    response.end();
  } else {
    const { productId } = request.params;
    const itemToDelete = findProductOrBrand(productId, loggedInUser.cart);
    if(!itemToDelete){
      response.writeHead(404, "Product not found");
      response.end();
    }
    //valid product to delete from a logged in user
    const newCart = loggedInUser.cart.filter(item => item.id !== itemToDelete.id);
    loggedInUser.cart = newCart;
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end();
  }
});

module.exports = server