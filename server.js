var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;


const PORT = 3001;
let products = [];
let brands = [];
let cart = [];
let accessTokens = [];
let users = [];

//Setup router
var myRouter = Router();

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
  let brandId = request.params
  //find out brand id in request
  //compare it to products categoryId
  //return back whatever matches
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(brands));
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
    }
  }
});

myRouter.get('/me/cart', function(request,response) {
  //look at request for access token
  //if accesstoken; what user matches accesstoken
  //return user's cart
  
  // Return all products in the products array
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(cart));
});

myRouter.post('/me/cart', function(request,response) {
  const addedProductToCart = cart.push(request.body)

  // Return all success with added Product
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(cart));
});


myRouter.delete('/me/cart/:productId', function(request,response) {
  const foundCartItem = cart.filter((item => item.id == request.id))

  cart.remove(foundCartItem)

	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end();
});

myRouter.post('/me/cart/:productId', function(request,response) {
  const addedProductToCart = cart.push(request.body)

  // Return all success with added Product
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(cart));
});

module.exports = {server, products}