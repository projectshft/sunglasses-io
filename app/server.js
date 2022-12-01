// Import all built-in node modules and methods, as well as installed modules 
const http = require('http');
const fs = require('fs');
const finalHandler = require('finalHandler');
const queryString = require('queryString');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const url = require('url');
const Brand = require('../models/brand')
const Product = require('../models/product')


// State holding variables 
let brands = [];
let products = [];
let cart = [];
let accessTokens = [];
let failedLoginAttempts = {};

// Establish port 
const PORT = 3001;

// Set up router 
const myRouter = Router()
myRouter.use(bodyParser.json())

// Establish server with finalHandler 
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});
server.listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  } 

fs.readFile('app/brands.json', 'utf8', function (error, data) {
  if (error) throw error;
  brands = JSON.parse(data);
  console.log(`Server setup: ${brands.length} brands loaded`);
});
fs.readFile('app/products.json', 'utf8', function (error, data) {
  if (error) throw error;
  products = JSON.parse(data);
  console.log(`Server setup: ${products.length} products loaded`);
});
console.log(`Server is listening on ${PORT}`);
});

myRouter.get('/v1/brands', (request, response) => {
  const query = url.parse(request.url, true).query;
    
  if(!query.dname) {
   const brandsToReturn = Brand.getBrands();
   response.writeHead(200, { 'Content-Type': 'application/json'});
   return response.end(JSON.stringify(brandsToReturn));
  }

// Public route - all users of the API can access products by brand name 
// myRouter.get("brands/:id/products", (request, response) => {
//   let productsByBrand = [
//     {
//       id: "2",
//       brand: "Ray Ban",
//       name: "Wayfarers",
//       description: "The best glasses in the world",
//       price: 100,
//       "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
//     },
//   ]
//   let brands  = brands.name

//   const parsedUrl = url.parse(request.originalUrl);
//   const { query } = queryString.parse(parsedUrl.query);
 
//   const brandId = brands.id;
//   const productId = products.categoryId
  
//   // start with error if (!productsByBrand) { 404, 'There are no products with that brand name}
//   if (brandId === productId) {
//     productsByBrand = products.filter(product => product.id && product.categoryId(brand));
//     productsByBrand.push(Product.getProductsByBrand(brand));
//   }
//   if (query !== undefined) {
    
//   // }
// }; 
 
// // Public route - all users of the API can access products 
// myRouter.get('/products', function (request, response) {
//   products.categoryId = brands.name
//   const parsedUrl = url.parse(request.originalUrl);
//   const { query, sort } = queryString.parse(parsedUrl.query);
//   let productsToReturn = [];
//   if (query !== undefined) {
//     productsToReturn = products.filter(product => product.name || product.cateoryId || product.price.includes(query));
//   }
//     if(!productsToReturn) {
//       response.writeHead(404, 'There are no products matching the query');
//       return response.end();
//     } else {
//   productsToReturn = products;
// }
// if (sort !== undefined) {
//   productsToReturn.sort((a, b) => a[sort] - b[sort]);
// }
// response.writeHead(200, { "Content-Type": "application/json" });
// return response.end(JSON.stringify(productsToReturn));
// });

// //  *******START WORK HERE!!!!!*****************AND TEST QUERY FOR ABOVE 
  
// // Public route - all users of the API can add items to shopping cart
// myRouter.get('/api/cart', function (request, response) {
//   response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
// });

// // Helpers to get/set our number of failed requests per username
// var getNumberOfFailedLoginRequestsForUsername = function(username) {
//   let currentNumberOfFailedRequests = failedLoginAttempts[username];
//   if (currentNumberOfFailedRequests) {
//     return currentNumberOfFailedRequests;
//   } else {
//     return 0;
//   }
// }

// var setNumberOfFailedLoginRequestsForUsername = function(username,numFails) {
//   failedLoginAttempts[username] = numFails;
// }

// // Login call
// myRouter.post('/api/login', function(request, response) {
//   // Make sure there is a username and password in the request
//   if (request.body.username && request.body.password && getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3) {
//     // See if there is a user that has that username and password
//     let user = users.find((user) => {
//       return user.login.username == request.body.username && user.login.password == request.body.password;
//     });

//     if (user) {
//       // If we found a user, reset our counter of failed logins
//       setNumberOfFailedLoginRequestsForUsername(request.body.username,0);

//       // Write the header because we know we will be returning successful at this point and that the response will be json
//       response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));

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
//           token: uid(16)
//         }
//         accessTokens.push(newAccessToken);
//         return response.end(JSON.stringify(newAccessToken.token));
//       }
//     } else {
//       // Update the number of failed login attempts
//       let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(request.body.username);
//       setNumberOfFailedLoginRequestsForUsername(request.body.username,++numFailedForUser);
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
// var getValidTokenFromRequest = function(request) {
//   var parsedUrl = require('url').parse(request.url,true)
//   if (parsedUrl.query.accessToken) {
//     // Verify the access token to make sure its valid and not expired
//     let currentAccessToken = accessTokens.find((accessToken) => {
//       return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

// // Only logged in users can update the quantity of items in their cart
// myRouter.get('/api/me/cart/{productId}', function(request,response) {
//   let currentAccessToken = getValidTokenFromRequest(request);

//   if (!currentAccessToken) {
//     // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
//     response.writeHead(401, "You need to be signed in to perform this action", CORS_HEADERS);
//     return response.end();
//   } else {
//     // Verify that the product exists in the cart to know if we should continue processing
//     let product = products.find((product) => {
//       console.log(product);
//       return product.id == request.params.productId;
//     });
//     if (!product) {
//       // If there isn't a store with that id, then return a 404
//       response.writeHead(404, "That product cannot be found", CORS_HEADERS);
//       return response.end();
//     }
     
//     // Only if the user's cart contains the productId do we return the product from the cart
//     if (cart.productId.includes(request.params.productId)) {
//       console.log('me/cart/{productId}', cart.productId);
//       response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
//       return response.end(JSON.stringify(cart.productId));
//     } else {
//       response.writeHead(403, "Unable to process request", CORS_HEADERS);
//       return response.end();
//     }
//   }
// });

// //// BEGIN WORKING HERE AFTER COMPLETE CHECKING ABOVE CODE FOR ACCURACY AND TO SEE IF IT WORKS!!!

// // Only managers can update a store's issues
// myRouter.post('/api/stores/:storeId/issues', function(request,response) {
//   let currentAccessToken = getValidTokenFromRequest(request);
//   if (!currentAccessToken) {
//     // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
//     response.writeHead(401, "You need to have access to this call to continue", CORS_HEADERS);
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
//     if (user.storeIds.includes(request.params.storeId) && (user.role == "MANAGER" )) {
//       store.issues = request.body;
//       response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
//       return response.end(JSON.stringify(store.issues));
//     } else {
//       response.writeHead(403, "You don't have access to that store", CORS_HEADERS);
//       return response.end();
//     }
//   }
//   })
// })


