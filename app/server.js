var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001; // Port for server to listen on

// State holding variables
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Creates server
const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
})
.listen(PORT, error => {
  if (error) throw error;
  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
  });
  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
  });
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
  });
});

/* GET /api/brands (Publicly Available)
 This endpoint gives the user all of the available brands as JSON. */

myRouter.get("/api/brands", (request, response) => {
  if (brands.length === 0) {
    response.writeHead(404, "No brands available");
    response.end();
  }
  response.writeHead(200, "Successfully retrieved brands", {"Content-Type": "application/json"});
  response.end(JSON.stringify(brands));
});

// GET /api/products (Public)
myRouter.get("/api/products", (request, response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(JSON.stringify(products));
});

// GET /api/brands/:id/products (Public specific category/brand of product)
myRouter.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const productsByBrand = products.filter(product => product.categoryId === id);
  if (productsByBrand.length === 0) {
    response.writeHead(404, "No products found for that brand ID");
    response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(productsByBrand));
});

// POST /api/login (User Login)
myRouter.post("/api/login", (request,response) => {
  response.writeHead(200, {'Content-Type': 'application/json'});
  if (request.headers.username && request.headers.password) {
    let user = users.find((user) => {
      return user.login.username == request.headers.username && user.login.password == request.headers.password;
    });
    if (user) {
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });
      
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
        response.writeHead(401, "Invalid username or password");
        response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted credentials");
    response.end();
  }    
});

// GET /api/me/cart (Get User specific cart)
myRouter.get("/api/me/cart", (request, response) => {
  let validAccessToken = getValidTokenFromRequest(request);
  if (!validAccessToken) {
    response.writeHead(401, "You need to have access to this endpoint to continue");
    response.end();
  } else {
      let userAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.token == request.headers.token;
        });
      let user = users.find((user) => {
        return user.login.username == userAccessToken.username;
      });    
    if (!user) {
      response.writeHead(404, "That user cannot be found");
      response.end();
      return;
    } else {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(user.cart));
    }
  }
});

// PUT /api/me/cart (Update quantities in cart)
myRouter.put("/api/me/cart", (request, response) => {
  let validAccessToken = getValidTokenFromRequest(request);
  if (!validAccessToken) {
    response.writeHead(401, "You need to have access to this endpoint to continue");
    response.end();
  } else {
      let userAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.token == request.headers.token;
        });
      let user = users.find((user) => {
        return user.login.username == userAccessToken.username;
      });    
    if (!user) {
      response.writeHead(404, "That user cannot be found");
      response.end();
      return;
    } else {
        const updatedQuantities = JSON.parse("[" + request.headers.updatedquantities + "]");
          user.cart.forEach((item, index) => {
          item.quantity = updatedQuantities[index];
        })
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(user.cart));
    }
  }
});

// DELETE /api/me/cart/:productId (Delete product from cart)
myRouter.delete("/api/me/cart/:productId", (request, response) => {
  let validAccessToken = getValidTokenFromRequest(request);
  if (!validAccessToken) {
    response.writeHead(401, "You need to have access to this endpoint to continue");
    response.end();
  } else {
      let userAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.token == request.headers.token;
        });
      let user = users.find((user) => {
        return user.login.username == userAccessToken.username;
      });    
    if (!user) {
      response.writeHead(404, "That user cannot be found");
      response.end();
      return;
    } else {
        response.writeHead(200, {'Content-Type': 'application/json'});
        const { productId } = request.params;
        const cartAfterDelete = user.cart.filter(product => product.id !== productId);
        response.end(JSON.stringify(cartAfterDelete));
    }
  }
});

// POST /api/me/cart/:productId (Add a product to cart)
myRouter.post("/api/me/cart/:productId", (request, response) => {
  let validAccessToken = getValidTokenFromRequest(request);
  if (!validAccessToken) {
    response.writeHead(401, "You need to have access to this endpoint to continue");
    response.end();
  } else {
      let userAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.token == request.headers.token;
        });
      let user = users.find((user) => {
        return user.login.username == userAccessToken.username;
      });    
    if (!user) {
      response.writeHead(404, "That user cannot be found");
      response.end();
      return;
    } else {
        const { productId } = request.params;
        const validProductId = products.find(product => product.id === productId);
        if (!validProductId) {
          response.writeHead(400, "Not a valid product Id");
          response.end();
        }
        const productInCart = user.cart.find(product => product.id === productId);
        if (!productInCart) {
        const productToAdd = products.filter(product => product.id === productId);
        Object.assign(productToAdd[0], {"quantity": 1});
        user.cart.push(productToAdd[0]);
        } else {
          productInCart.quantity += 1;
        }
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(user.cart));
    }
  }
});

const getValidTokenFromRequest = function(request) {
  if (request.headers.token) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == request.headers.token && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

module.exports = server;