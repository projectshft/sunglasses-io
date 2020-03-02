const http = require('http');
const finalHandler = require('finalhandler');
const Router = require("router");
const bodyParser   = require('body-parser');
const fs = require('fs');
const url = require("url");
const querystring = require('querystring');
var uid = require('rand-token').uid;

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// State holding variables
let brands = [];
let user = {};
let products = [];
let users = [];
let accessTokens = [];
 // An access token can look like this:
 // {
 //   username: 'sean',
 //   lastUpdated: <A valid date>,
 //   token: 'qwertyuiopasdfg1'
 // }
let failedLoginAttempts = {};
 // failed atthempt can look like this:
 // {
 //   username: 'sean',
 //   lastAttempt: <A valid date>,
 //   count: 0
 // }
let cart = [];

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((req, res) => {
    res.writeHead(200);
    myRouter(req, res, finalHandler(req, res));
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

//GET all the brands
myRouter.get("/api/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  let brandsToReturn = [];
  if (query !== undefined) {
    brandsToReturn = brands.filter(brand => brand.name.includes(query));

    if (!brandsToReturn) {
      response.writeHead(404, "Sorry we cannot return the brand you searched.");
      return response.end();
    }
  } else {
    brandsToReturn = brands;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
});

//GET all products of a particular brand
myRouter.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const brand = brands.find(brand => brand.id == id);
  if (!brand) {
    response.writeHead(404, "That brand does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedBrands = brands.filter(
    brand => brand.id === id
  );
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(relatedBrands));
});

//GET all of the products
myRouter.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  let productsToReturn = [];
  if (query !== undefined) {
    productsToReturn = products.filter(product => product.name.includes(query));

    if (!productsToReturn) {
      response.writeHead(404, "Sorry we cannot return the product you searched.");
      return response.end();
    }
  } else {
    productsToReturn = products;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});


//POST token for Login call
myRouter.post('/api/login', function(request,response) {
  if (!failedLoginAttempts[request.body.username]){
    failedLoginAttempts[request.body.username] = 0;
  
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password && failedLoginAttempts[request.body.username] < 3) {
    // See if there is a user that has that username and password
    let user = users.find((user)=>{
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      // Reset our counter of failed logins
      failedLoginAttempts[request.body.username] = 0;
      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, {'Content-Type': 'application/json'});
      }
      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((accessToken) => {
        return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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
        return response.end(JSON.stringify(newAccessToken.token));
      }

    } else {
      let numFailedForUser = failedLoginAttempts[request.body.username];
      if (numFailedForUser) {
        failedLoginAttempts[request.body.username]++;
      } else {
        failedLoginAttempts[request.body.username] = 1
      }
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }

  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

// Helper method to process access token
// var getValidTokenFromRequest = function(currentAccessToken) {
//   if (currentAccessToken) {
//     // Verify the access token to make sure its valid and not expired
//     let currentAccessToken = accessTokens.find((accessToken) => {
//       return accessToken.token == currentAccessToken.token && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
//     });
//     if (currentAccessToken) {
//       return currentAccessToken;
//     } else {
//       return null;
//     }
//   } else {
//     return null;
//   }
// };

//GET logged in user's cart
myRouter.get('/api/me/cart', function(request,response) {

  //find user based on accessToken
  const signedInUsername = accessTokens[0].username;
  const currentUser = users.find((user) => {
    return user.login.username == signedInUsername
  });

  //if no user is logged in
  if (!currentUser) {
    response.writeHead(401, "User must be signed in to see cart");
    return response.end();
  }

  //Check to see if cart is empty
  cart = currentUser.cart
  if(cart.length == 0){
    response.writeHead(404, "Sorry cart is empty, add something to see cart");
    return response.end();
  }

  //return user's cart
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cart))
});

//POST one product to user cart
myRouter.post("/api/me/cart", (request, response) => {
  //find user based on accessToken
  const signedInUsername = accessTokens[0].username;
  const currentUser = users.find((user) => {
    return user.login.username == signedInUsername
  });
  
  //if no user is logged in
  if (!currentUser) {
    response.writeHead(401, "User must be signed in to add to your cart");
    return response.end();
  }
  
  let addedItem = request.body
  //create a quantity key/value on the posted item
  addedItem.quantity = 1

  //if post product is missing id, categoryId, name, or price
	if (!addedItem.id || !addedItem.categoryId || !addedItem.name || !addedItem.price) {
		response.writeHead(400);	
		return response.end("Incorrectly formatted response. Must have id, categoryId, name & price.");
  }

  cart = currentUser.cart
  //Does item exist in the cart? Find the item
  const doesItemExistInCart = cart.find((item) => {
    return item.id == addedItem.id
  });

  //If the item does not exist in the cart then push the item to the cart
  //if it does exist increase the quantity by one
  if(!doesItemExistInCart){
    cart.push(addedItem)
  }else{
    doesItemExistInCart.quantity ++
  }

	// Return success with last added item 
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(addedItem));
});

//DELETE one product from a user's cart
myRouter.delete("/api/me/cart/:productId", (request, response) => {
  //find current user's cart
  const signedInUsername = accessTokens[0].username;
  const currentUser = users.find((user) => {
    return user.login.username == signedInUsername
  });
  cart = currentUser.cart

  const { productId } = request.params;
  //find the item to delete from the cart
  const itemSelectedToDelete = cart.find(item => item.id == productId);
  if (!itemSelectedToDelete) {
    response.writeHead(404, "That item does not exist in user's cart");
    return response.end("That item does not exist in user's cart");
  }
  //if itemSelectedToDelete.quantity == 1 filter out
  if(itemSelectedToDelete.quantity == 1){
    //filter item out of the cart 
    currentUser.cart = cart.filter((keepItem => keepItem.id != productId))
  }else{
    //if product has a quantity greater than 1, subtract one from the quantity key
    itemSelectedToDelete.quantity --
  }
  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(itemSelectedToDelete));
});

//POST (change) one product's quantity in a user's cart
myRouter.post("/api/me/cart/:productId", (request, response) => {
  //find current user's cart
  const signedInUsername = accessTokens[0].username;
  const currentUser = users.find((user) => {
    return user.login.username == signedInUsername
  });
  cart = currentUser.cart

  const { productId } = request.params;
  let itemAndSelectedQuantity = request.body

  //if post product is missing id, categoryId, name, or price
	if (!itemAndSelectedQuantity.id || !itemAndSelectedQuantity.categoryId || !itemAndSelectedQuantity.name || !itemAndSelectedQuantity.price || !itemAndSelectedQuantity.quantity) {
		response.writeHead(400);	
		return response.end("Incorrectly formatted response. Must have id, categoryId, name & price.");
  }

  //Find the item
  let itemSelectedToChangeQuantity = cart.find((item) => {
    return item.id == productId
  });

  //If the item does not exist respond with error message
  if(!itemSelectedToChangeQuantity){
    response.writeHead(404, "That item does not exist in user's cart");
    return response.end();
  }else {
    //exists in the cart then change quantity to passed in request
    Object.assign(itemSelectedToChangeQuantity, itemAndSelectedQuantity)
    // currentUser.cart.itemSelectedToChangeQuantity.quantity == itemAndSelectedQuantity.quantity
  }
  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(itemSelectedToChangeQuantity));
});

module.exports = server;
