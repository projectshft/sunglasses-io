var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
// To parse request bodies
var bodyParser = require('body-parser');
// To generate access tokens
var uid = require('rand-token').uid;

const PORT = 3001;
// This obviously should be done in a more dynamic way with a database storing currently valid keys without requiring a redeploy to change access.
// But we haven't learned databases yet, so we are where we are.
const VALID_API_KEYS = ["88312679-04c9-4351-85ce-3ed75293b449","1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7"];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
// State holding variables
var stores = [];
var users = [];
var accessTokens = [];
var failedLoginAttempts = {};

// Setup router
var myRouter = Router()
myRouter.use(bodyParser.json())

http.createServer(function (request, response) {
  // Handle CORS Preflight request
  if (request.method === 'OPTIONS'){
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }

  // Verify that a valid API Key exists before we let anyone access our API
  if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
    response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
    return response.end();
  }
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('stores.json', 'utf8', function (error, data) {
    if (error) throw error;
    stores = JSON.parse(data);
    console.log(`Server setup: ${stores.length} stores loaded`);
  });
  fs.readFile('users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// Public route - all users of API can access
myRouter.get('/api/stores', function(request,response) {
  response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  // Filter out the store issues since that is protected data
  return response.end(JSON.stringify(stores.map((store)=> {
    let clonedStore = Object.assign({}, store);
    delete clonedStore.issues;
    return clonedStore;
  })));
});

// Helpers to get/set our number of failed requests per username
var getNumberOfFailedLoginRequestsForUsername = function(username) {
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

// Login call
myRouter.post('/api/login', function(request, response) {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
    // See if there is a user that has that username and password
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });

    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumberOfFailedLoginRequestsForUsername(request.body.username,0);

      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
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
      // Update the number of failed login attempts
      let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
      setNumberOfFailedLoginRequestsForUsername(request.body.username,++numFailedForUser);
      // When a login fails, tell the client in a generic way that either the username or password was wrong
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
var getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url,true)
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure its valid and not expired
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

// Only logged in users can access a specific store's issues if they have access
myRouter.get('/api/stores/:storeId/issues', function(request,response) {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue", CORS_HEADERS);
    return response.end();
  } else {
    // Verify that the store exists to know if we should continue processing
    let store = stores.find((store) => {
      console.log(store);
      return store.id == request.params.storeId;
    });
    if (!store) {
      // If there isn't a store with that id, then return a 404
      response.writeHead(404, "That store cannot be found", CORS_HEADERS);
      return response.end();
    }

    // Check if the current user has access to the store
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    
    // Only if the user has access to that store do we return the issues from the store
    if (user.storeIds.includes(request.params.storeId)) {
      console.log('store: ', store);
      response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
      return response.end(JSON.stringify(store.issues));
    } else {
      response.writeHead(403, "You don't have access to that store", CORS_HEADERS);
      return response.end();
    }
  }
});

// Only managers can update a store's issues
myRouter.post('/api/stores/:storeId/issues', function(request,response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue", CORS_HEADERS);
    response.end();
  } else {
    // Verify that the store exists to know if we should continue processing
    let store = stores.find((store) => {
      return store.id == request.params.storeId;
    });
    if (!store) {
      // If there isn't a store with that id, then return a 404
      response.writeHead(404, "That store cannot be found", CORS_HEADERS);
      return response.end();
    }

    // Check if the current user has access to the store
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    // Only if the user has access to that store do we return the issues from the store
    if (user.storeIds.includes(request.params.storeId) && (user.role == "MANAGER" )) {
      store.issues = request.body;
      response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
      return response.end(JSON.stringify(store.issues));
    } else {
      response.writeHead(403, "You don't have access to that store", CORS_HEADERS);
      return response.end();
    }
  }
});