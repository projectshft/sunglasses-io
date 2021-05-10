var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var Router = require('router');
var bodyParser = require('body-parser');
const url = require("url");
var queryString = require('querystring');
var uid = require('rand-token').uid;

let brands = [];
let users = [];
let products = [];
let accessTokens = [];
let failedLoginAttempts = {};
let cart = [{
  token: uid(16),
  items: [{
    brandId: 1,
    quantity: 3,
  }]
}]

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
    brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"))
    products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"))
    users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"))
});

myRouter.get('/brands', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get('/brands/:brandId/products', function(request,response) {
  const { brandId } = request.params;
  const brand = brands.find(brand => brand.id == brandId);

  if (!brand) {
    response.writeHead(404, "That brand does not exist");
    return response.end();
  }
	response.writeHead(200, { "Content-Type": "application/json" });
	const brandProducts = products.filter(products => products.brandId === brandId);

  console.log(brandProducts);
  return response.end(JSON.stringify(brandProducts));
});

myRouter.get('/products', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

var failedLogins = function(username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
}

var setNumberOfFailedLoginRequestsForUsername = function(username,numFails) {
  failedLoginAttempts[username] = numFails;
}

myRouter.post('/login', function(request, response) {
  if (request.body.username && request.body.password && failedLogins(request.body.username) < 3) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });

    if (user) {
      setNumberOfFailedLoginRequestsForUsername(request.body.username,0);

      response.writeHead(200, Object.assign({'Content-Type': 'application/json'}));

      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
      setNumberOfFailedLoginRequestsForUsername(request.body.username,++numFailedForUser);
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

var getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url,true)
  if (parsedUrl.query.accessToken) {
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
//fetch cart
myRouter.get('/me/cart', function(request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  let cart = [{
    token: uid(16),
    items: [
      {
      brandId: 1,
      quantity: 3,
    },
    {
      brandId: 3,
      quantity: 4,
    },
  ]
  }]
  if (!currentAccessToken) {
    response.writeHead(401, "You must be logged in to view your cart");
    return response.end();
  }
  
  if(cart.items === []) {
    response.writeHead(404, "Your cart is empty");
    return response.end();
  }
   else {
    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(cart));
   }
});
//add to cart
myRouter.post('/me/cart/', function(request, response) {
  const product = products.find(product => product.id == id);

  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "You must be logged in to add an item to your cart");
    return response.end();
  }

  response.writeHead(200), {'Content-Type': 'application/json'};
  cart.push(product);
  return response.end(JSON.stringify(cart));  
});
//delete product from cart 
myRouter.delete('/me/cart/:id', function(request, response) {
  const { id } = request.params
  const product = products.find(product => product.id == id);

  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "You must be logged in to delete an item from your cart");
    return response.end();
  } 
  if (!product) {
    response.writeHead(404, "Product not found");
    return response.end();
  }
  response.writeHead(200);
  //want to update cart here but not sure how to reference specific index. I assume it would be in the url. Same below for updating quantity
  product.cart.splice()
  return response.end(JSON.stringify(cart));  
});

//change quantity of product
myRouter.post('/me/cart/:id', function(request, response) {
  const { id } = request.params
  const product = products.find(product => product.id == id);

  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "You must be logged in to edit items in your cart");
    return response.end();
  }
  if (!product) {
    response.writeHead(404, "Product not found");
    return response.end();
  }

  response.writeHead(200);
  product.cart.splice()
  return response.end(JSON.stringify(cart));  
});

module.exports = server;