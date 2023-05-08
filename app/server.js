var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

//api key storage
const VALID_API_KEYS = ["98738203-8dsj-0983-9f72-di29dk38djk3", "8di3k99l-5305-8dk3-1849-zjdf938jfj98"];


let brands = [];
let products = [];
let users = [];
let accessTokens = [];
let failedLoginAttempts = {};
//cart will probably need to be an empty array to post product/brand db info to;


//Setup for the router
let myRouter = Router();
myRouter.use(bodyParser.json());
//Setup for server
let server = http.createServer(function (request, response) {


  if(!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
    response.writeHead(401, "You need to have a valid API key to use this API")
  }
  // console.log(request.headers);
  
  response.writeHead(200);

    myRouter(request, response, finalHandler(request, response))
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port port ${PORT}`);
  //populate brands
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  // console.log(brands);
  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  // console.log(products);
  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));

})
//GET all brands
myRouter.get("/api/brands", function(request,response) {
  if(!request) {
    return console.log('request not defined')
  }
  let brandsToReturn = [];
  brandsToReturn = brands;
  // console.log('brands to return', brandsToReturn);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
})

//GET all products of a single brand (by categoryId)
myRouter.get("/api/brands/:id/products", (request, response) =>{
  const { id } = request.params;
  const category = brands.find(category => category.id == id);
  if (!category) {
    response.writeHead(404, "That brand does not exist");
    return response.end()
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedProducts = products.filter(
    products => products.categoryId === id
  )
  // console.log(relatedProducts);
  return response.end(JSON.stringify(relatedProducts));
})
//GET all products
myRouter.get("/api/products", function(request,response) {
  if(!request) {
    return console.log('request not defined')
  }
  let productsToReturn = [];
  productsToReturn = products;
  // console.log('products to return', productsToReturn);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
})

//Functions to help manage failed requests by username
let getNumFailedLoginRequestsForUsername = (username) => {
  let currentNumFailedRequests = failedLoginAttempts[username];
  if(currentNumFailedRequests) {
    return currentNumFailedRequests;
  }
  return 0;
}
let setNumFailedLoginRequestsForUsername = (username, numFails) => {
  failedLoginAttempts[username] = numFails;
}

//User Login request
myRouter.post('/api/login', (request, response) =>{
  // console.log(request.body)
  if(request.body.username && request.body.password && getNumFailedLoginRequestsForUsername(request.body.username) < 3) {
    // console.log(request.body.username, ' --- ',request.body.password)
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    })
    if(user) {
      setNumFailedLoginRequestsForUsername(request.body.username, 0);
      response.writeHead(200, 'login successful');
      // console.log(user);
      let currentAccessToken = accessTokens.find((tokenObj) => {
        return tokenObj.username == user.login.username;
      })
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      }
      //Create new access token if one doesn't already exist
      let newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16)
      }
      accessTokens.push(newAccessToken);
      console.log(accessTokens[0].token);
      return response.end(JSON.stringify(newAccessToken.token));
    }
    let numFailsForUser = getNumFailedLoginRequestsForUsername(request.body.username);
    setNumFailedLoginRequestsForUsername(request.body.username, ++numFailsForUser);
    response.writeHead(401, 'invalid username or password');
    return response.end();
  }
  response.writeHead(400, "incorrectly formatted response");
  return response.end();
})

module.exports = server;
