var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const hostname = 'localhost';
const PORT = 3001;

const TOKEN_TIMEOUT = 5 * 60 * 1000 //5 minute validity timeout

//State holding variables
let brands = [];
let products = [];
let users = [];
let user = {};
let accessTokens = [];


//Router set up
var myRouter = Router();
myRouter.use(bodyParser.json());

//helper function to extract access token for endpoints needing a log in
let getToken = function(request){
  let extractedToken = request.headers.authorization.split(' ')[1];
  let foundToken = accessTokens.find(accessToken =>{
    return accessToken.token == extractedToken && ((new Date) - accessToken.lastUpdated) < TOKEN_TIMEOUT;
  });
  if (foundToken) {
    return foundToken;
  } else{
    return null;
  }
}

// //helper function to get number of failed log in attempts
// let getFailedAttempts = function(username){
//   let currentFailedAttempts = failedLogInAttempts[username];
//   if (currentFailedAttempts){
//     return currentFailedAttempts;
//   } else{
//     return 0;
//   }
// }
// //helper function set number of failed log in attempts
// let setFailedAttempts = function(username, numAttempts) {
//   failedLogInAttempts[username] = numAttempts;
// }

const server = module.exports = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  //load data from files into server memory
  brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('../initial-data/users.json', 'utf-8'));
  // user = users[0];
});
//return brands of sunglasses
myRouter.get('/api/brands', function(request, response){
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(brands));
});


myRouter.get('/api/brands/:id/products', function(request, response){
  // brand id retrieved from params
  const { id } = request.params;
  let productsByBrand = [];
  productsByBrand = products.filter(product => product.categoryId === id);
  if(productsByBrand.length === 0){
   response.writeHead(404, 'Brand not found');
   return response.end();
  } else {
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(productsByBrand));
  }
});
//return products by search
myRouter.get('/api/products', function(request, response){
  if(request._parsedUrl.query === null || !request._parsedUrl.query.includes('=')){
    response.writeHead(400, 'Invalid Request Format');
    return response.end();
  }
  //isolate query from path, use lowercase so case mismatch won't impact return
  let searchString = request._parsedUrl.query.toLowerCase();
  let queryObject = queryString.parse(searchString);
  //new array with filtered results of products that match query
  let searchResults = products.filter(product => {
    let productName = product.name.toLowerCase();
    return productName.includes(queryObject.query);
  });
  if(searchResults.length === 0){
    response.writeHead(404, 'No matching results found');
    return response.end();
  }
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(searchResults));
});

myRouter.post('/api/login', function(request, response){
  let email = request.body.email;
  let password = request.body.password;
  //first check that required elements are present
  if (!email || !password){
    response.writeHead(400, 'Invalid request.');
    return response.end();
  }
  //find user that matches info sent in body of request
  let foundUser = users.find((user) => {
    return user.email === request.body.email && user.login.password === request.body.password  
  });
 
  //check number of log in attempts for user
  // if (getFailedAttempts(foundUser.login.username) > 3){
  //   response.writeHead(403, 'Exceeded 3 failed log in attempts. Try again later.')
  //   return response.end();
  // }
  
  //if that user is found, return an access token 
  if(foundUser) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    let currentToken = {
      user: foundUser.login.username,
      lastUpdated: new Date (),
      token: uid(16)
    }
    accessTokens.push(currentToken);
    return response.end(JSON.stringify({'token': currentToken.token}));
    } else{
      response.writeHead(401, 'Invalid username or password');
      return response.end();
    } 
})

myRouter.get('/api/me/cart', function(request, response){
  //check if access token is present in header of request as specified in api docs
  if(!request.headers.authorization){
    response.writeHead(400, 'Invalid Request');
    return response.end();
  }
  //check validity of token
  let authToken = getToken(request);
  if (authToken){
    response.writeHead(200, {'Content-Type': 'application/json'});
    //access user's cart
    let loggedInUser = users.find((user) => {
      return authToken.user === user.login.username
    })
    return response.end(JSON.stringify(loggedInUser.cart));
  } else {
    response.writeHead(401, 'Invalid or expired access token.');
    return response.end();
  }
})

