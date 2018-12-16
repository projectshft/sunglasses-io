var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser  = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;
const { findProductOrBrand, findProductsByQueryTerms } = require("./utils");

// State holding variables
let brands = [];
let products = [];
let users = [];
let loggedInUser = {};
let accessTokens = [];

const PORT = 3001;

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((request, response) => {
   response.writeHead(200);
   router(request, response, finalHandler(request, response));
});

server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);
    //populate brands
    brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));
    //populate products
    products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf8"));
    //populate users
    users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf8"));
    //hardcoded user
    loggedInUser = users[0];
});

//GET all brands from the store
router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

//GET all products by brand id from the store
router.get("/api/brands/:brandId/products", (request, response) => {
  const { brandId } = request.params;
  const brand = findProductOrBrand(brandId, brands);
  if (!brand) {
    response.writeHead(404, "That brand does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const brandProducts = products.filter(
    product => product.categoryId === brandId
  );
  return response.end(JSON.stringify(brandProducts));
});

//GET products from the store based on a query string
router.get('/api/products', (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let queryArray = [];
  let productsToReturn = [];
  if (query) {
    queryArray = query.split(' ');
  }
  
  //findProductsByQueryTerms is written in utils.js
  if (query !== undefined && query !== ""){
    productsToReturn = findProductsByQueryTerms(queryArray, products);
  } else {
    productsToReturn = products;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn))
});

//POST login
router.post('/api/login', function(request,response) {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password 
    let user = users.find((user)=>{
      return user.email == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, {'Content-Type': 'application/json'});
  
      // Successful login, check for existing access token
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.email;
      });
  
      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.email,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, "Invalid username or password");
      response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the request
    response.writeHead(400, "Incorrectly formatted request");
    response.end();
  }
  });

module.exports = server