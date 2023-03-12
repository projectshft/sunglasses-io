var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const Brands = require('../initial-data/brands.json');
const Products = require('../initial-data/products.json');
const Users = require('../initial-data/users.json');

const PORT = 3001;

let accessTokens = [];

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

// TODO: GET all brands
myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Brands));
})

// TODO: GET all products given brand id
myRouter.get('/api/brands/:id/products', function(request, response) {
  const { id } = request.params;
  const products = Products.find(product => product.categoryId == id);
  if (!products) {
    response.writeHead(404, "That brand id does not exist");
    return response.end();
  }
  response.writeHead(200, {"Content-Type": "application/json"});
  const relatedProducts = Products.filter(product => product.categoryId == id);
  return response.end(JSON.stringify(relatedProducts));
})

// TODO: GET all products
myRouter.get('/api/products', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Products));
})

// TODO: POST login
myRouter.post(`/api/login`, function(request, response) {
  if (!request.body.username || !request.body.password) {
    response.writeHead(400, "Username and password is required.");
    return response.end();
  }

  let username = Users.find(user => user.login.username == request.body.username) 
  let password = Users.find(user => user.login.password == request.body.password)

  if (!username) {
    response.writeHead(400, "Incorrect username or password, try again.");
    return response.end();
  } else {
    if (!password) {
      response.writeHead(400, "Incorrect password.");
      return response.end();
    } else {
      response.writeHead(200,{"Content-Type": "application/json"});
      
      let currentAccessToken = accessTokens.find((token) => {
        return token.username == username;
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: username,
          lastUpdated: new Date(),
          token: uid(16),
        };
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    }
  }
})

module.exports = server;
