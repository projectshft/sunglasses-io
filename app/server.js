var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// // Created with https://www.uuidgenerator.net/
// const VALID_API_KEYS = ["e633b606 - b480 - 11e8 - 96f8 - 529269fb1459",
// "e633b89a - b480 - 11e8 - 96f8 - 529269fb1459",
// "e633b9ee - b480 - 11e8 - 96f8 - 529269fb1459"];

//State holding variables
var brands = [];
var users = [];
var products = [];
var accessTokens = [];
var failedLoginAttempts = {};

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//create server and set it to listen to the port variable value
http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

//the GET/api/brands does not take parameters and sends back an array of brands
myRouter.get('/api/brands', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }));
  response.end(JSON.stringify(brands));
});

//when a user sends a brand id as a parameter, the server will copy the products array and filter out products whose categoryid does not match the brand id
myRouter.get('/api/brands/:id/products', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }));
  let productsSortedByBrand = products.filter((product) => {
    return product.categoryId == request.params.id;
  });
  response.end(JSON.stringify(productsSortedByBrand));
});

//for the search bar, GET/api/products will return all products
//*** TODO *** since very large inventories would not want to send back all products, it may be good here to add in some optional search parameters ****
myRouter.get('/api/products', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }));
  response.end(JSON.stringify(products));
});

// POST/api/login will check to see if username and login sent in request match credentials saved in fs - user will be locked out after 3 failed login attempts
// User login
myRouter.post('/api/login', (request, response) => {
if (!failedLoginAttempts[request.body.username]) {
  failedLoginAttempts[request.body.username] = 0;
}
//first we make sure the client sent back the correct parameters and they haven't exceeded login attempts
if (request.body.username && request.body.password && failedLoginAttempts[request.body.username] < 3) {
  
  //next match the parameters received with credentials saved in fs
  let user = users.find((user) => {
    return user.login.username == request.body.username && user.login.password == request.body.password;
  });

    if (user) {
      // Reset our counter of failed logins
      failedLoginAttempts[request.body.username] = 0;
    
      // Write the header because we know we will be returning  successful at this point and that the response will be json
      response.writeHead(200, Object.assign({ 'Content-Type':   'application/json' }));
    
    // We have a successful login, if we already have an existing   access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
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
      let numFailedForUser = failedLoginAttempts[request.body.username];
      if (numFailedForUser) {
        failedLoginAttempts[request.body.username]++;
      } else {
        failedLoginAttempts[request.body.username] = 0
      }
      response.writeHead(401, "Invalid username or password");
      response.end();
    }
  }
}); 