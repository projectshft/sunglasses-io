var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var url = require("url");
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const Brands = require('../initial-data/brands.json');
const Products = require('../initial-data/products.json');
const Users = require('../initial-data/users.json');

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

let accessTokens = [];

// Helper method to process access token
let getAccessToken = function (request) {
  let parsedUrl = require("url").parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == parsedUrl.query.accessToken && new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
    });

    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

// TODO: GET all brands
myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Brands));
})

// TODO: GET all products given brand id
myRouter.get('/api/brands/:id/products', function(request, response) {
  const { id } = request.params;
  const products = Products.find(product => product.categoryId == id);
  if (!products) {
    response.writeHead(400, "That brand id does not exist");
    return response.end();
  }
  response.writeHead(200, {"Content-Type": "application/json"});
  const relatedProducts = Products.filter(product => product.categoryId == id);
  return response.end(JSON.stringify(relatedProducts));
})

// TODO: GET all products
myRouter.get('/api/products', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Products));
})

// TODO: POST login
myRouter.post(`/api/login`, function(request, response) {
  if (!request.body.username || !request.body.password) {
    response.writeHead(400, "Username and password is required.");
    return response.end();
  }

  let username = Users.find(user => user.login.username == request.body.username) 
  let password = Users.find(user => user.login.password == request.body.password)

  if (!username) {
    response.writeHead(400, "Incorrect username or password, try again.");
    return response.end();
  } else {
    if (!password) {
      response.writeHead(400, "Incorrect password.");
      return response.end();
    } else {
      response.writeHead(200,{"Content-Type": "application/json"});
      
      let currentAccessToken = accessTokens.find((token) => {
        return token.username == username;
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: username,
          lastUpdated: new Date(),
          token: uid(16),
        };
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    }
  }
})

// TODO: GET user's cart
myRouter.get(`/api/me/cart`, function(request, response) {
  let currentAccessToken = getAccessToken(request);
  if (!currentAccessToken) {
    response.writeHead(400, "Please sign in to view your cart.")
    return response.end();
  } else {
    let cart = currentAccessToken.username.cart
    response.writeHead(200, {"Content-Type": "application/json"});
    return response.end(JSON.stringify(cart));
  }
})

// TODO: POST add product to cart
myRouter.post(`/api/me/cart`, function(request, response) {
  // TODO: write logic to check access token
  let currentAccessToken = getAccessToken(request);

  if (!currentAccessToken) {
    response.writeHead(400, "Please sign in to add product.")
    return response.end();
  } else {
    // TODO: parse product id
    const parsedUrl = url.parse(request.url);
    const { productId } = queryString.parse(parsedUrl.query);
    // TODO: find product id from list of products
    let product = Products.find(product => product.id == productId)

    if (!product) {
      response.writeHead(400, "Product not found.")
      return response.end();
    } else {
    // TODO: add product to user's cart
      let cart = currentAccessToken.username.cart;
      cart.push(product);
      response.writeHead(200, {"Content-Type": "application/json"});
      return response.end(JSON.stringify(cart));
    }
  }
})

// TODO: DELETE product from user's cart
myRouter.delete(`/api/me/cart/:productId`, function(request, response) {
  let currentAccessToken = getAccessToken(request);

  if (!currentAccessToken) {
    response.writeHead(400, "Please sign in to delete product.")
    return response.end();
  } else {
    let product = Products.find(product => product.id == request.params.productId)

    if(!product) {
      response.writeHead(400, "Product not found.")
      return response.end();
    } else {
      let cart = currentAccessToken.username.cart;
      let updatedCart = cart.filter(product => product.id !== request.params.productId);
      cart = updatedCart;

      response.writeHead(200, {"Content-Type": "application/json"});
      return response.end(JSON.stringify(cart));
    }
  }
})

// TODO: Change quantity of product
myRouter.post(`/api/me/cart/:productId/:quantity`, function(request, response) {
  let currentAccessToken = getAccessToken(request)

  if (!currentAccessToken) {
    response.writeHead(400, "Please sign in to change quantity.")
    return response.end();
  } else {
    // TODO: find product id in cart
    let cart = currentAccessToken.username.cart;
    let product = cart.find(product => product.id == request.params.productId)

    if (!product) {
      response.writeHead(400, "Can't find product in cart")
      return response.end(); 
    } else {
      // TODO: change quantity in cart
      product.quantity = parseInt(request.params.quantity);
      response.writeHead(200, {"Content-Type": "application/json"});
      return response.end(JSON.stringify(cart));
    }
  }
})

module.exports = server;
