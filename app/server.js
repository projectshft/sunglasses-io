const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

// State holding variables
let products = [];
let brands = [];
let users = [];
let accessTokens = [];

const TOKEN_VALIDITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

// Helper method to proccess access token
var getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  // Load data from server
  products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));

  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));

  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
});

myRouter.get('/api/brands', (request, response) => {
  if (!brands) {
    response.writeHead(404, "There are no brands to return");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(brands));
  }
});

myRouter.get('/api/brands/:id/products', (request, response) => {
  // Find brand by id
  let brand = brands.find((brand) => {
    return brand.id == request.params.id
  })
  // Filter out products that are not from that brand
  let brandProducts = products.filter(p => p.brandId === brand.id);
  if (!brandProducts) {
    response.writeHead(404, "There are no products to return");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(brandProducts));
  }
});

myRouter.get('/api/products', (request, response) => {
  if (!products) {
    response.writeHead(404, "There are no products to return");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(products));
  }
});

myRouter.post('/api/login', (request, response) => {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      
      // Check to see if there is an existing access token for the user.  If so, use that token.
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Check to see if access token is current
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Otherwise, create a new token for the user
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token))
      }
    } else {
      response.writeHead(401, "Invalid username of password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted request");
    return response.end();
  }
})

myRouter.get('/api/me/cart', (request, response) => {
  // Check if user is actively logged in
  let currentAccessToken = getValidTokenFromRequest(request);
  
  if (!currentAccessToken) {
    response.writeHead(401, "You need to be logged in to see your cart");
    return response.end();
  } 
    // Access user profile
  let user = users.find((user) => {
    return user.login.username == currentAccessToken.username;
  });
    
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(user.cart));
});

myRouter.post('/api/me/cart/:productId', (request, response) => {
  // Check if user is actively logged in
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "You need to be logged in to access your cart");
    return response.end();
  } 
  // Access user profile
  let user = users.find((user) => {
    return user.login.username == currentAccessToken.username;
  });

  let product = products.find( p => p.id == request.params.productId);
  if (!product) {
    response.writeHead(404, "Product not found in the store.");
    return response.end();
  } 

  if (!user.cart.includes(product)) {
    product.quanity = 1;
    user.cart.push(product);
    response.writeHead(200, { 'Content-Type': 'application/json' })
    return response.end(JSON.stringify(user.cart));
  } 
  // else {
    // find the index of the product in user.cart and increment the quantity
})

myRouter.delete('/api/me/cart/:productId', (request, response) => {
  // Check if user is actively logged in
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "You need to be logged in to access your cart");
    return response.end();
  } 
  // Access user profile
  let user = users.find((user) => {
    return user.login.username == currentAccessToken.username;
  });
  
  // update cart to only contain products that have a different id than given in the request
  let updatedCart = user.cart.filter( p => p.id !== request.params.productId); 
  user.cart = updatedCart;
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(user.cart));
});

module.exports = server 