var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const brandsJson = require('./../initial-data/brands.json');
const productsJson = require('./../initial-data/products.json')
const usersJson = require('./../initial-data/users.json')

const PORT = 8080;
let accessToken = {};

accessToken = {
  username: "yellowleopard753",
  lastUpdated: new Date(),
  token: uid(16),
};

let server = http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT);

const myRouter = Router();

// GET /brands
myRouter.get("/api/brands", (request, response) => {
  // get brands json file directly  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsJson));
});

// GET /api/brands/:id/products
myRouter.get("/api/brands/:id/products", (request, response) => {
  let catCode = brandsJson[request.params.id].id;

  let results = productsJson;

  let results2 = results.filter(x => parseInt(x.categoryId) == catCode);

  if (!catCode) {
    response.writeHead(404);
    return response.end("Brand Not in Stock");
  }

  response.writeHead(200, {"Content-Type": "application/json" });
  return response.end(JSON.stringify(results2));
})

// GET /products
myRouter.get("/api/products", (request, response) => {
  // get products json file directly  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsJson));
});

//GET retrieves resources.
//POST submits new data to the server.
//PUT updates existing data.
//DELETE removes data.

// POST /login
myRouter.post("/api/login", function(request, response) {
  // See if there is a user that has that username and password
  let user = users.find((u) => {
    return (
      u.tempUsername == request.body.username &&
      u.tempPassword == request.body.password
    );
  });

  // Write the header because we know we will be returning successful at this point and that the response will be json
  response.writeHead(
    200,
    Object.assign(CORS_HEADERS, { "Content-Type": "application/json" })
  );

  // if user exists, create access token
  accessToken = {
    username: request.params.username,
    lastUpdated: new Date(),
    token: uid(16),
  };
});

// myRouter.post("/api/login", function (request, response) {
//   // Make sure there is a username and password in the request
//   if (
//     request.body.username &&
//     request.body.password &&
//     getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3
//   ) {
//     // See if there is a user that has that username and password
//     let user = users.find((user) => {
//       return (
//         user.login.username == request.body.username &&
//         user.login.password == request.body.password
//       );
//     });

//     if (user) {
//       // If we found a user, reset our counter of failed logins
//       setNumberOfFailedLoginRequestsForUsername(request.body.username, 0);

//       // Write the header because we know we will be returning successful at this point and that the response will be json
//       response.writeHead(
//         200,
//         Object.assign(CORS_HEADERS, { "Content-Type": "application/json" })
//       );

//       // We have a successful login, if we already have an existing access token, use that
//       let currentAccessToken = accessTokens.find((tokenObject) => {
//         return tokenObject.username == user.login.username;
//       });

//       // Update the last updated value so we get another time period
//       if (currentAccessToken) {
//         currentAccessToken.lastUpdated = new Date();
//         return response.end(JSON.stringify(currentAccessToken.token));
//       } else {
//         // Create a new token with the user value and a "random" token
//         let newAccessToken = {
//           username: user.login.username,
//           lastUpdated: new Date(),
//           token: uid(16),
//         };
//         accessTokens.push(newAccessToken);
//         return response.end(JSON.stringify(newAccessToken.token));
//       }
//     } else {
//       // Update the number of failed login attempts
//       let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(
//         request.body.username
//       );
//       setNumberOfFailedLoginRequestsForUsername(
//         request.body.username,
//         ++numFailedForUser
//       );
//       // When a login fails, tell the client in a generic way that either the username or password was wrong
//       response.writeHead(401, "Invalid username or password");
//       return response.end();
//     }
//   } else {
//     // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
//     response.writeHead(400, "Incorrectly formatted response");
//     return response.end();
//   }
// });

// // Helper method to process access token
// var getValidTokenFromRequest = function (request) {
//   var parsedUrl = require("url").parse(request.url, true);
//   if (parsedUrl.query.accessToken) {
//     // Verify the access token to make sure its valid and not expired
//     let currentAccessToken = accessTokens.find((accessToken) => {
//       return (
//         accessToken.token == parsedUrl.query.accessToken &&
//         new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
//       );
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


// GET /api/me/cart
myRouter.get("/api/me/cart", function (request, response) {
  // get cart for user
  // let cartUser = accessToken.user;
  // console.log(cartUser);

  // let cart = usersJson.filter(x => x.username === cartUser);

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify([]));
})

// // Only logged in users can access a specific store's issues if they have access
// myRouter.get("/api/stores/:storeId/issues", function (request, response) {
//   let currentAccessToken = getValidTokenFromRequest(request);

//   if (!currentAccessToken) {
//     // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
//     response.writeHead(
//       401,
//       "You need to have access to this call to continue",
//       CORS_HEADERS
//     );
//     return response.end();
//   } else {
//     // Verify that the store exists to know if we should continue processing
//     let store = stores.find((store) => {
//       console.log(store);
//       return store.id == request.params.storeId;
//     });
//     if (!store) {
//       // If there isn't a store with that id, then return a 404
//       response.writeHead(404, "That store cannot be found", CORS_HEADERS);
//       return response.end();
//     }

//     // Check if the current user has access to the store
//     let user = users.find((user) => {
//       return user.login.username == currentAccessToken.username;
//     });

//     // Only if the user has access to that store do we return the issues from the store
//     if (user.storeIds.includes(request.params.storeId)) {
//       console.log("store: ", store);
//       response.writeHead(
//         200,
//         Object.assign(CORS_HEADERS, { "Content-Type": "application/json" })
//       );
//       return response.end(JSON.stringify(store.issues));
//     } else {
//       response.writeHead(
//         403,
//         "You don't have access to that store",
//         CORS_HEADERS
//       );
//       return response.end();
//     }
//   }
// });

// // Only managers can update a store's issues
// myRouter.post("/api/stores/:storeId/issues", function (request, response) {
//   let currentAccessToken = getValidTokenFromRequest(request);
//   if (!currentAccessToken) {
//     // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
//     response.writeHead(
//       401,
//       "You need to have access to this call to continue",
//       CORS_HEADERS
//     );
//     response.end();
//   } else {
//     // Verify that the store exists to know if we should continue processing
//     let store = stores.find((store) => {
//       return store.id == request.params.storeId;
//     });
//     if (!store) {
//       // If there isn't a store with that id, then return a 404
//       response.writeHead(404, "That store cannot be found", CORS_HEADERS);
//       return response.end();
//     }

//     // Check if the current user has access to the store
//     let user = users.find((user) => {
//       return user.login.username == currentAccessToken.username;
//     });
//     // Only if the user has access to that store do we return the issues from the store
//     if (
//       user.storeIds.includes(request.params.storeId) &&
//       user.role == "MANAGER"
//     ) {
//       store.issues = request.body;
//       response.writeHead(
//         200,
//         Object.assign(CORS_HEADERS, { "Content-Type": "application/json" })
//       );
//       return response.end(JSON.stringify(store.issues));
//     } else {
//       response.writeHead(
//         403,
//         "You don't have access to that store",
//         CORS_HEADERS
//       );
//       return response.end();
//     }
//   }
// });

module.exports = server;


