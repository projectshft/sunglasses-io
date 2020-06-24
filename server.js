var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
const PORT = 3001;

let products = [];
let brands = [];
let cart = [];
let accessTokens = [];
let users = [];

//Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

// parse application/x-www-form-urlencoded
myRouter.use(bodyParser.urlencoded({ extended: false }))

let server = http.createServer(function (request, response) {

  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
    // Load dummy data into server memory for serving
    brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
  
    // Load all products into products array
    products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
    
    // Load all users into users array
    users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
});

myRouter.get('/products', function(request,response) {
  
  // Return all products in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(products));
});

myRouter.get('/brands', function(request,response) {
  
  // Return all brands in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(brands));
});

myRouter.get('/brands/:id/products', function(request,response) {
  //retrieve brand id from request
  let brandId = request.params.id
  
  //compare brand id to product's categoryId
  let productMatch = products.filter(product => product.categoryId === brandId)

  if (productMatch. length === 0) {
    response.writeHead(404, "No products match that Id");
    return response.end();
  }

  //return back matches
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(productMatch));
});

myRouter.post('/api/login', function(request,response) {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password
    let user = users.find((user)=>{
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });

    if (user) {

      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      if (currentAccessToken) {
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

myRouter.get('/me/cart', function(request,response) {
  //pull from request the access token
  let token = request.body.token
  
  //match access token from body of request to accessTokens array
  let tokenMatch = accessTokens.find((access) => {
    return access.token == token;
  })

  //match username in accessToken array to users array
  let userMatch = users.find((user) =>  {
    return user.login.username == tokenMatch.username
  })

  //return user's cart
	response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(userMatch.cart))
});

myRouter.post('/me/cart', function(request,response) {
  //pull from request the access token & product to post to cart
  let token = request.body.token
  let productId = request.body.item
  
  //match access token from body of request to accessTokens array
  let tokenMatch = accessTokens.find((access) => {
    return access.token == token;
  })

  //match username in accessToken array to users array
  let userMatch = users.find((user) =>  {
    return user.login.username == tokenMatch.username
  });

  let productToAdd = products.find((product) => {
    return product.id == productId
  });
  
  //add product from request body to user's cart
  userMatch.cart.push(productToAdd)

	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(productToAdd));
});


myRouter.delete('/me/cart/:productId', function(request,response) {
  //pull from request the access token & product to delete from cart
  let productToDelete = request.params.productId;
  let token = request.body.token;

  //match access token from body of request to accessTokens array
  let tokenMatch = accessTokens.find((access) => {
    return access.token == token;
  })

  //match username in accessToken array to users array
  let userMatch = users.find((user) =>  {
    return user.login.username == tokenMatch.username
  })

  //find location in array of the first item in cart that matches
  //the product id in the request
  let productToDeleteInCart = userMatch.cart.findIndex((product) => {
    return product.id == productToDelete
  });
  
  //remove product from user's cart
  userMatch.cart.splice(productToDeleteInCart, 1)

	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(`Product successfully deleted`);
});

myRouter.post('/me/cart/:productId', function(request,response) {
  //pull from request the access token & product to post to cart
  let token = request.body.token
  let productId = request.params.productId
  
  //match access token from body of request to accessTokens array
  let tokenMatch = accessTokens.find((access) => {
    return access.token == token;
  })

  //match username in accessToken array to users array
  let userMatch = users.find((user) =>  {
    return user.login.username == tokenMatch.username
  });

  let productToAdd = products.find((product) => {
    return product.id == productId
  });
  
  //add product from request body to user's cart
  userMatch.cart.push(productToAdd)

	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(productToAdd));
});

module.exports = {server, products}