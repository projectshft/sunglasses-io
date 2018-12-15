var http = require('http');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const fs = require('fs');
const url = require('url');
const CONTENT_HEADERS = {"Content-Type": "application/json"};
const PORT = 3001;

//initial state variables
let brands, products, users;
let accessTokens = [];
let currentUserIndex = null;
let cartId = 1;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//for sorting products by price
const compare = (a,b) => {
  console.log('first price', a.price);
  console.log('second price', b.price);
  return Number(a.price) > Number(b.price);
}

const server = http.createServer(function (req, res) {
  myRouter(req, res, finalHandler(req, res))
});

server.listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }
  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));
  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf8"));
  products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf8"));
  console.log(`Server is listening on ${PORT}`);
});

myRouter.get('/api/brands', (req,res) => {
    res.writeHead(200, CONTENT_HEADERS);
    res.end(JSON.stringify(brands));
}) 

myRouter.get('/api/brands/:id/products', (req,res) => {
  const productsByBrand = products.filter(product => product.brandId == req.params.id);
  if (productsByBrand.length > 0) {
    res.writeHead(200, CONTENT_HEADERS);
    res.end(JSON.stringify(productsByBrand));
  } else {
    res.writeHead(404, "Brand ID not found");
    res.end();
  }
}) 

//account for different cases
myRouter.get('/api/products', (req,res) => {
  const parsedUrl = url.parse(req.originalUrl);
  let { search } = queryString.parse(parsedUrl.query);
  let productsToReturn = [];
  if (search === undefined || search === "") {
    productsToReturn  = products;
    res.writeHead(200, CONTENT_HEADERS);
    res.end(JSON.stringify(productsToReturn));
  } else {
      search = search.toUpperCase();
      productsToReturn = products.filter(product => {
        let productName = product.name.toUpperCase();
        let productDescription = product.description.toUpperCase();
        return (productName.includes(search) || productDescription.includes(search));
      });
    if (!productsToReturn) {
      res.writeHead(404, "No products were found with that search");
      res.end();
    } else {
      res.writeHead(200, CONTENT_HEADERS);
      res.end(JSON.stringify(productsToReturn));
    }
  } 
}) 

myRouter.post('/api/login', (req,res) => {
    // Make sure there is a username and password in the request
    if (req.body.username && req.body.password) {
      let user = users.find((user)=>{
          return user.login.username == req.body.username && user.login.password == req.body.password;
      });
      if (user) {
        //update the state in order to track the currently logged in user
        currentUserIndex = users.indexOf(user);
        // Write the header because we know we will be returning successful at this point and that the response will be json
        res.writeHead(200, CONTENT_HEADERS);
        // We have a successful login, if we already have an existing access token, use that
        let currentAccessToken = accessTokens.find(tokenObject => tokenObject.username == user.login.username);
        // Update the last updated value so we get another time period
        if (currentAccessToken) {
          currentAccessToken.lastUpdated = new Date();
          res.end(JSON.stringify(currentAccessToken));
        } else {
          // Create a new token with the user value and a "random" token
          let newAccessToken = {
            username: user.login.username,
            lastUpdated: new Date(),
            token: uid(16)
          }
          accessTokens.push(newAccessToken);
          res.end(JSON.stringify(newAccessToken));
        }
      }     else {
        res.writeHead(401, "Invalid username or password");
        res.end();
      }
    } else {
      // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
      res.writeHead(400, "Incorrectly formatted request: need a username and password");
      res.end();
    }; 
});


myRouter.get('/api/me/cart', (req,res) => {
  res.writeHead(200, CONTENT_HEADERS);
  res.end();
}) 

myRouter.post('/api/me/cart', (req,res) => {
  //get the token from the headers
  let sentToken = req.headers["x-authentication"];
  //if there is a token, then see if the token is in the valid list and make sure it hasn't timed out
  if (sentToken) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == sentToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
    });
    //if there's a valid token, move forward with processing the request
    if (currentAccessToken) {
      //make sure that a product was sent as a query
      const parsedUrl = url.parse(req.originalUrl);
      let { productId } = queryString.parse(parsedUrl.query);
      let productToAdd = products.find(product => product.id == productId);
      //if there's a valid product, then add it to the cart with a unique cart ID and quantity 1 
      if (productToAdd) {
        productToAdd.cartId = cartId;
        cartId++;
        productToAdd.quantity = 1;
        users[currentUserIndex].cart.push(productToAdd)
        res.writeHead(200, CONTENT_HEADERS);
        res.end(JSON.stringify(productToAdd));
        //if the product ID doesn't exist, tell the user
      } else {
        res.writeHead(404, "Product ID not found");
        res.end();
      }
     //if the login is expired (or if an invalid token was sent), tell the user
    } else {
      res.writeHead(401, "Your authentication is invalid, please log in again");
      res.end();
    }
    //if the user didn't send a token at all, tell them to login
  } else {
    res.writeHead(401, "Login is required");
    res.end();
  }
}) 

myRouter.delete('/api/me/cart/:productId', (req,res) => {

}) 

myRouter.post('/api/me/cart/:productId', (req,res) => {

})

module.exports = server;
