var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const Brands = require('./models/brands-model');
const Products = require('./models/products-model');
const UserCart = require('./models/cart-model');
const User = require('./models/login-model');

const PORT = 3001;

var users = [{
  "gender": "female",
  "cart": [],
  "name": {
      "title": "mrs",
      "first": "susanna",
      "last": "richards"
  },
  "location": {
      "street": "2343 herbert road",
      "city": "duleek",
      "state": "donegal",
      "postcode": 38567
  },
  "email": "susanna.richards@example.com",
  "login": {
      "username": "yellowleopard753",
      "password": "jonjon",
      "salt": "eNuMvema",
      "md5": "a8be2a69c8c91684588f4e1a29442dd7",
      "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
      "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
  },
  "dob": "1954-10-09 10:47:17",
  "registered": "2003-08-03 01:12:24",
  "phone": "031-941-6700",
  "cell": "081-032-7884",
  "picture": {
      "large": "https://randomuser.me/api/portraits/women/55.jpg",
      "medium": "https://randomuser.me/api/portraits/med/women/55.jpg",
      "thumbnail": "https://randomuser.me/api/portraits/thumb/women/55.jpg"
  },
  "nat": "IE"
}];

//setup the router
var myRouter = Router();
myRouter.use(bodyParser.json());

//assign server to a variable for export
let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))

}).listen(PORT);

//Handle get request to return all available brands
myRouter.get('/api/brands', function(request,response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Brands.getAllBrands()));
})

//Handle get request to return all available products
myRouter.get('/api/products', function(request,response) {
  const parsedUrl = require('url').parse(request.url, true);
  
  if (parsedUrl.query.searchString) {
    const idOfSearchedBrand = Brands.getIdOfSearchedBrand(parsedUrl.query.searchString);

    const foundProducts = Products.searchProductsByQuery(parsedUrl.query.searchString, idOfSearchedBrand);

    response.writeHead(200, {"Content-Type": "application/json"});
    
    return response.end(JSON.stringify(foundProducts));
  } else {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Products.getAllProducts()));
  }
})


//Handle get request to return all available products of a particular brand 
myRouter.get('/api/brands/:id/products', function(request, response) {
 
  //First get the brand from the brand id (query param)
  const selectedBrandId = request.params.id;
  
  //If brand id was not provided in the query, return error
  if (!selectedBrandId) {
    response.writeHead(400);
    return response.end("Unable to complete request")
  }

  // If there are no brands matching the brand Id from the query, return error
  // if (getProductsByBrandId(selectedBrandId).length == 0) {
  //   response.writeHead(404);
  //   return response.end("No products found");
  // }
  // Return the available products available for the particular brand id
  response.writeHead(200, {"Content-Type": "application/json"});

  return response.end(JSON.stringify(Products.getProductsByBrandId(selectedBrandId)))
})


//Handle request to return all the products in a user's cart
myRouter.get('/api/me/cart', function(request,response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(UserCart.getEntireCart()));
})


//Handle request to add a product to the cart, added product will be returned in the response
myRouter.post('/api/me/cart', function(request,response) {
  //If product doesn't have an id, return an error
  if (!request.body.id ){
		response.writeHead(400);
		return response.end("Cannot add product to cart");
  }
  
  //Add item to cart and assign a variable to the added item
  const addedProduct = UserCart.addProduct(request.body);

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(addedProduct));
});


//Handle request for testing if a book is successfully removed from the cart
myRouter.get('/api/me/cart/:productId', function(request,response) {

  const productInCart = UserCart.findProductInCart(request.params.productId);

  if (productInCart) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(productInCart));

  } else {
    response.writeHead(404);
    return response.end("Item is not in the cart");
  }
})



//Handle request for removing a product from the user's cart by its id (parameter)
myRouter.delete('/api/me/cart/:productId', function(request,response) {
  // Check if product is in cart
  const foundProduct = UserCart.findProductInCart(request.params.productId);

  // If product is not in the cart, return an error
  if (!foundProduct) {
    response.writeHead(404);
    return response.end("Product not found");
  }

  // At this point, we know the product is in the cart and we can now remove it
  UserCart.deleteProduct(request.params.productId);

  // Return success code for removing the product
  response.writeHead(200);
	return response.end();
})

// Handle post request to change quantity of item in cart
myRouter.post('/api/me/cart/:productId', function(request,response) {
  // Check if product is in cart
  const foundProduct = UserCart.findProductInCart(request.params.productId);

  // If product is not in the cart, return an error
  if (!foundProduct) {
    response.writeHead(404);
    return response.end("Product not found");
  }

  // At this point, we know the product is in the cart and we can now update the quantity
  const updatedProduct = UserCart.changeQuantityOfProduct(request.body)

  // Return success code for updating the product. Return the updated product so the quantity can be tested. 
  response.writeHead(200, {"Content-Type": "application/json"});
	return response.end(JSON.stringify(updatedProduct));
})

//Handle post request to login the user
myRouter.post('/api/login', function(request,response) {
   // Make sure there is a username and password in the request (handle the numberOfFailedRequests next, just checking login credentials first)
  //  if (request.body.email && request.body.login.password && getNumberOfFailedLoginRequestsForUsername(request.body.login.username) < 3) {
    // check for email and username and password in request
    if (request.body.email && request.body.login.username && request.body.login.password) {
    // See if there is a user that has that username and password
    let user = users.find((user)=>{
      return user.login.username == request.body.login.username && user.login.password == request.body.login.password;
    });

    if (user) {
      // If we found a user, reset our counter of failed logins
      // setNumberOfFailedLoginRequestsForUsername(request.body.username,0);

      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, {'Content-Type': 'application/json'});
      return response.end(JSON.stringify(user));
      // We have a successful login, if we already have an existing access token, use that
      // let currentAccessToken = accessTokens.find((tokenObject) => {
      //   return tokenObject.username == user.login.username;
      // });

      // Update the last updated value so we get another time period before expiration
      // if (currentAccessToken) {
      //   currentAccessToken.lastUpdated = new Date();
      //   return response.end(JSON.stringify(currentAccessToken.token));
      // } else {
      //   // Create a new token with the user value and a "random" token
      //   let newAccessToken = {
      //     username: user.login.username,
      //     lastUpdated: new Date(),
      //     token: uid(16)
      //   }
      //   accessTokens.push(newAccessToken);
      //   return response.end(JSON.stringify(newAccessToken.token));
      // }
    } else {
      // Update the number of failed login attempts
      // let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
      // setNumberOfFailedLoginRequestsForUsername(request.body.username,++numFailedForUser);
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response, be generic for security purposes
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});



module.exports = server;