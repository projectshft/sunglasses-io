var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

const VALID_API_KEYS = ["4b425343-82c8-4f8f-a44c-c86263e360e2", "eeee3997-d7c1-4814-939f-04eca8c9977e"];

// State holding variables
var brands = [];
var products = [];
var users = [];
var accessTokens = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
  // Verify that a valid API Key exists before we let anyone access our API
  if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
    response.writeHead(401, "You need to have a valid API key to use this API");
    response.end();
  }
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('./initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// Helper method to process access token
var getValidTokenFromRequest = function (request) {
  const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  let passedToken = request._parsedUrl.query;
  if (passedToken) {
    // Verify the access token to make sure its valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == passedToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

myRouter.get('/api/brands', (request, response) => {
  limit = request._parsedUrl.query;
  brandList = brands.slice(0, limit)
  if (brands) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(brandList));
  }
  response.writeHead(404, "Brands not found.")
  return response.end();
});

myRouter.get('/api/brands/:id/products', (request, response) => {
  let matchingProducts = products.filter((product) => {
    return product.categoryId == request.params.id;
  });
  if (matchingProducts.length > 0) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(matchingProducts));
  }
  response.writeHead(404, "No matching products found")
  return response.end();
});

myRouter.get('/api/products', (request, response) => {
  // the includes method is case sensitive so we convert the search term and the product name to lower case.
  let query = request._parsedUrl.query.toLowerCase()
  let matchingProducts = []

  products.filter((product) => {
    if (product.name.toLowerCase().includes(query)) {
      matchingProducts.push(product)
    }
  });
  if (matchingProducts.length > 0) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(matchingProducts));
  }
  response.writeHead(404, "No matching products found")
  return response.end()
});

myRouter.post('/api/login', (request, response) => {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password 
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, { 'Content-Type': 'application/json' });
      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        tokenObject.username == user.login.username;
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
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  }
  // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
  response.writeHead(400, "Incorrectly formatted response");
  response.end();
});

myRouter.get('/api/me/', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (currentAccessToken) {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username | null;
    });
    //create an object containing only the user info that we want to send.
    let userInfo = {}
    userInfo.cart = user.cart;
    userInfo.name = user.name;
    userInfo.location = user.location;
    userInfo.email = user.email;

    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(userInfo));
  }
  response.writeHead(401, "You must be logged in to access your account")
  return response.end();
});

myRouter.get('/api/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (currentAccessToken) {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username | null;
    });
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(user.cart));
  }
  response.writeHead(401, "You must be logged in to access your cart")
  return response.end();
});

myRouter.post('/api/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (currentAccessToken) {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    let productId = request.body.productId;
    let newQuantity = request.body.quantity;
    let currentQuantity = user.cart.filter(product => product.id == productId).length;
    let productToModify = products.filter(product => product.id == productId);
    //verify that the product ID matches one of our products
    if (productToModify.length > 0) {
      // We are either INCREASING the current quantity...
      if (currentQuantity < newQuantity) {
        //set the number by which to modify the quantity.
        let diff = newQuantity - currentQuantity
        //add the product to the cart until diff is 0.
        while (diff > 0) {
          user.cart.push(productToModify[0]);
          diff--;
        }
      //... or we are DECREASING the current quantity.
      } else if (currentQuantity > newQuantity) {
        //set the number by which to modify the quantity.
        let diff = currentQuantity - newQuantity;
        //Iterate through cart. When a match occurs, delete it until diff = 0.
        for (let i = 0; i < user.cart.length; i++) {
          let currentItem = user.cart[i];
          if (currentItem.id == productId) {
            while (diff > 0) {
              user.cart.splice(i, 1);
              diff--;
            }
          }
        }
      }
      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify(user.cart));
    }
    response.writeHead(404, "The specified product was not found")
    return response.end();
  }
  response.writeHead(401, "You must be logged in to modify your cart")
  return response.end();
});

myRouter.delete('/api/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (currentAccessToken) {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    let idToDelete = request.params.productId;
    //filter the array to return everything but the deleted product.
    let newCart = user.cart.filter(product => product.id !== idToDelete )
    user.cart = newCart
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(user.cart));    
  }
  response.writeHead(401, "You must be logged in to modify your cart")
  return response.end();
});

myRouter.post('/api/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (currentAccessToken) {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    let idToAdd = request.params.productId;
    let productToAdd = products.filter(product => product.id == idToAdd)
    if (productToAdd.length > 0) {
      user.cart.push(productToAdd[0])
      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify(user.cart));
    } else {
      response.writeHead(404, "The product was not found, no changes have been made to the cart")
      return response.end();
    }
  }
  response.writeHead(401, "You must be logged in to modify your cart")
  return response.end();
});