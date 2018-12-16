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

// Set up router
var myRouter = Router();
myRouter.use(bodyParser.json());

const checkValidityOfToken = req => {
  //get the token from the headers
  let sentToken = req.headers["x-authentication"];
  //if there is a token, then see if the token is in the valid list and make sure it hasn't timed out
  if (sentToken) {
    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token == sentToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
    })
    //if there's a valid token, then update the current user state and return true
    if (currentAccessToken) {
      let currentUser = users.find(user => user.login.username == currentAccessToken.username);
      currentUserIndex = users.indexOf(currentUser);
      return true;
      //if the token is invalid or if none was sent, then return false
    } else {
      return false;
    }
  } else {
    return false;
  }
}

//set up the server and read in the initial data
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
  //make sure there are products available to return with that brand ID
  const productsByBrand = products.filter(product => product.brandId == req.params.id);
  if (productsByBrand.length > 0) {
    res.writeHead(200, CONTENT_HEADERS);
    res.end(JSON.stringify(productsByBrand));
  } else {
    res.writeHead(404, "Brand ID not found or no products currently in that brand");
    res.end();
  }
}) 

myRouter.get('/api/products', (req,res) => {
  //get the searched term out of the URL
  const parsedUrl = url.parse(req.originalUrl);
  let { search } = queryString.parse(parsedUrl.query);
  let productsToReturn = [];
  //if a search wasn't included or if it was empty, give back all the products
  if (search === undefined || search === "") {
    productsToReturn  = products;
    res.writeHead(200, CONTENT_HEADERS);
    res.end(JSON.stringify(productsToReturn));
  } else {
      //if a search was included, then match the name or description on existing products
      search = search.toUpperCase();
      productsToReturn = products.filter(product => {
        let productName = product.name.toUpperCase();
        let productDescription = product.description.toUpperCase();
        return (productName.includes(search) || productDescription.includes(search));
      });
    //if there was a search and nothing matched, then tell the user
    if (productsToReturn.length === 0) {
      res.writeHead(404, "No products were found with that search");
      res.end();
    //otherwise, return what matched the search
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
      // If they are missing one of the parameters, tell the user that something was wrong in the formatting of the response
      res.writeHead(400, "Incorrectly formatted request: need a username and password");
      res.end();
    }; 
});


myRouter.get('/api/me/cart', (req,res) => {
  if (checkValidityOfToken(req)) {
    res.writeHead(200, CONTENT_HEADERS);
    res.end(JSON.stringify(users[currentUserIndex].cart));
  } else {
    res.writeHead(401, "Your authentication is invalid, please log in again");
    res.end();
  }
}) 

myRouter.post('/api/me/cart', (req,res) => {
    //if there's a valid token, move forward with processing the request
    if (checkValidityOfToken(req)) {
      //make sure that a product was sent in the body
      if (req.body.productId) {
        let { productId } = req.body;
        let productToAdd = products.find(product => product.id == productId);
      //if there's a valid product, then add it to the cart with a unique cart ID and quantity 1 
        if (productToAdd) {
          productToAdd.cartId = cartId;
          cartId++;
          productToAdd.quantity = 1;
          //make a copy so that the cart IDs actually change
          let newProduct = {...productToAdd}
          users[currentUserIndex].cart.push(newProduct);
          res.writeHead(200, CONTENT_HEADERS);
          res.end(JSON.stringify(productToAdd));
          //if the product ID doesn't exist, tell the user
        } else {
          res.writeHead(404, "Product ID not found");
          res.end();
        }
        //no product ID sent in the body of the request
      } else {
        res.writeHead(400, "Bad request, a product ID is required") ;
        res.end();
      } 
      //if the login is expired (or if an invalid token was sent), tell the user
      } else {
        res.writeHead(401, "Your authentication is invalid, please log in again");
        res.end();
      }
  })


myRouter.delete('/api/me/cart/:cartId', (req,res) => {
  //if a valid user is logged in
  if (checkValidityOfToken(req)) {
    //find the cartId of the item to delete
    let productToDelete = users[currentUserIndex].cart.find(product => product.cartId == req.params.cartId);
    if (productToDelete){
      //filter that item out
      let newCart = users[currentUserIndex].cart.filter(product => product.cartId != productToDelete.cartId);
      //spread that filtered cart over the original to replace it
      users[currentUserIndex].cart = [...newCart];
      //send the deleted prodcut in the response as confirmation
      res.writeHead(200, CONTENT_HEADERS);
      res.end(JSON.stringify(productToDelete));
    } else {
      res.writeHead(404, "Cart ID not found");
      res.end(); 
    } 
  } else {
    res.writeHead(401, "Your authentication is invalid, please log in again");
    res.end();
  }
}) 

myRouter.post('/api/me/cart/:cartId', (req,res) => {
  //if a valid user is logged in
  if (checkValidityOfToken(req)) {
    //find the cartId of the item to update
    let productToUpdate = users[currentUserIndex].cart.find(product => product.cartId == req.params.cartId);
    if (productToUpdate) {
      //ensure that the request body was formatted correctly
      if (req.body.quantityIncrease && Number(req.body.quantityIncrease)) {
        //because productToUpdate is pointing to the same object, this also updates the user's cart
        productToUpdate.quantity += req.body.quantityIncrease;   
        res.writeHead(200, CONTENT_HEADERS);
        res.end(JSON.stringify(productToUpdate));
      } else {
        res.writeHead(400, "Bad request - a valid quantity increase is required");
        res.end()
      }
    } else {
      res.writeHead(404, "Cart ID not found");
      res.end();
    }
  } else {
    res.writeHead(401, "Your authentication is invalid, please log in again");
    res.end();
  }
})

module.exports = server;
