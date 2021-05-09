var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

let brands = [];
let cart = [];
var accessTokens = [];
let products = [];
let users = [];
var failedLoginAttempts = {};

const PORT = 3001;

const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  res.writeHead(200);
  router(request, response, finalHandler(request, response));
});




router.get('/api/brands', (request, response) => {
  if (!brand) {
    response.writeHead(404, 'That brand does not exist');
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brand));
});

router.get('/api/brands/:brandId/products', (request, response) => {
  
});

router.get('/api/products', (request, response) => {
  if (!product) {
    response.writeHead(404, 'That product does not exist');
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(product));
});


myRouter.post('/api/login', function(request, response) {
  
  if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
    
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });

    if (user) {
       setNumberOfFailedLoginRequestsForUsername(request.body.username,0);
      response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
      
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

router.get('/api/me/cart', (request, response) => {
  
});

router.post('/api/me/cart', (request, response) => {
  const { userId } = request.params;
  const user = users.find(user => user.id == userId);
  if (!goal) {
    response.writeHead(404, "That goal does not exist");
    return response.end();
  }
  response.writeHead(200);
  response.end();
});

router.delete('/api/me/cart/:productId', (request, response) => {
  
});

router.post('/api/me/cart/:productId', (request, response) => {
  const { productId } = request.params;
  const product = product.find(product => product.id == productId);
  if (!product) {
    response.writeHead(404, "That product does not exist");
    return response.end();
  }
  response.writeHead(200);
  product.push(cart);
  saveCurrentUser(user);
  response.end();
});


module.exports = server;