var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
const VALID_API_KEYS = ["88312679-04c9-4351-85ce-3ed75293b449","1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7"];
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

//state holding variables
var brands = [];
var products = [];
var users = [];
var failedLoginAttempts = {};
var uid = require('rand-token').uid;
var accessTokens = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());
http.createServer(function (request, response) {
if (request.method === 'OPTIONS') {
  response.writeHead(200, CORS_HEADERS);
  response.end();
}
// Verify that a valid API Key exists before we let anyone access our API
/*
if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
  response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
  response.end();
}
*/
myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
if (error) {
  return console.log('Error on Server Startup: ', error)
}


fs.readFile('./initial-data/brands.json', 'utf8', (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
});
fs.readFile('./initial-data/products.json', 'utf8', (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
});
fs.readFile('./initial-data/users.json', 'utf8', (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
});
console.log(`Server is listening on ${PORT}`);
});
// Public route - all users of API can access
myRouter.get('/api/brands', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
    response.end(JSON.stringify(brands));
});
myRouter.get('/api/brands/:id/products', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
    let productsByBrand = products.filter((product) => {
        return product.categoryId == request.params.id;
    });
    response.end(JSON.stringify(productsByBrand));
})
myRouter.get('/api/products', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type':'application/json'}));
    response.end(JSON.stringify(products));
}); 
// Only logged in users can access
//Login call
myRouter.post('/api/login', function(request,response) {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
    // See if there is a user that has that username and password 
    let user = users.find((user)=>{
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
      setNumberOfFailedLoginRequestsForUsername(request.body.username,0);
      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((accessToken) => {
        return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
      });
  
      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
      setNumberOfFailedLoginRequestsForUsername(request.body.username,numFailedForUser++);
      response.writeHead(401, "Invalid username or password");
      response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400, "Incorrectly formatted response");
    response.end();
  }
  });

/*
// example using authentication
myRouter.get('/api/products', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type':'application/json'}));
    if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
        response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
        response.end();
    }
    response.end(JSON.stringify(products));
}); 
*/