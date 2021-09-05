var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
const url = require("url");
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const { traceDeprecation } = require('process');

//state holding variables
let brands = [];
let users = [];
let user = {};
let products = [];
let accessTokens = ['sqHPTIt4wYP5dhpO'];

const PORT = process.env.PORT || 8080;

//setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//setup server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));

  users = JSON. parse(fs.readFileSync("initial-data/users.json", "utf-8"));

  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
});

myRouter.get('/brands', (request,response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
})

myRouter.get('/brands/:id/products', (req, res) => {
  const { id } = req.params;
  const productsResult = products.filter(product => product.categoryId == id);
  const brand = brands.find(brand => brand.id == id);
  
  if (!brand) {
    res.writeHead(404, "That brand does not exist");      
    return res.end();  
  } else if (!productsResult) {
    res.writeHead(404, "No products found");    
    return res.end();
  } else {
  res.writeHead(200, {"Content-Type": "application/json"});    
  return res.end(JSON.stringify(productsResult));
  }
})

myRouter.get('/products', (req, res) => {
  
  const parsedUrl = url.parse(req.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let productsToReturn = [];

  if (query !== undefined) {
    productsToReturn = products.filter(product => {
      return product.description.includes(query) || product.name.includes(query)
    });

    if (!productsToReturn) {
      res.writeHead(404, "No products match the search query");
      return response.end();
    } 
  } else {
    productsToReturn = products;
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  return res.end(JSON.stringify(productsToReturn));
})

myRouter.post("/login", (req, res) => {
  if (req.body.username && req.body.password) {
    let user=users.find((user) => {
      return user.login.username == req.body.username && user.login.password == req.body.password
    });

    if (user) {
      res.writeHead(200, { 'Content-Type': 'application/json'});

      let currentAccessToken = accessTokens.find((token) => {
        token.username == user.login.username
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();

        return res.end(JSON.stringify(currentAccessToken.token));
      } else {

        //why is new access token undefined??
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        
        accessTokens.push(newAccessToken);
        return res.end(JSON.stringify(newAccessToken.token))
      }
    } else {
      res.writeHead(401, "Invalid username or password");
      return res.end();
    }
  } else {
    res.writeHead(400, "incorrectly formatted response");
    return res.end();
  }
});

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

var getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
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
module.exports = server;