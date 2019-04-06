var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001; // Port for server to listen on

// State holding variables
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Creates server
const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
})
.listen(PORT, error => {
  if (error) throw error;
  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
  });
  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
  });
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
  });
});

// GET /api/brands (Public)
myRouter.get("/api/brands", (request, response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(JSON.stringify(brands));
});

// GET /api/products (Public)
myRouter.get("/api/products", (request, response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(JSON.stringify(products));
});

// GET /api/brands/:id/products (Public specific category/brand of product)
myRouter.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const productsByBrand = products.filter(product => product.categoryId === id);
  if (productsByBrand.length === 0) {
    response.writeHead(404, "No products found for that brand ID");
    response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(productsByBrand));
});

// POST /api/login (User Login)
myRouter.post("/api/login", (request,response) => {
  response.writeHead(200, {'Content-Type': 'application/json'});
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });
      
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
        response.writeHead(401, "Invalid username or password");
        response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted credentials");
    response.end();
  }    
});

module.exports = server;