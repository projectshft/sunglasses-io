var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
var users = require('../initial-data/users.json');

const Brands = require('../initial-data/brands.json')
const Products = require('../initial-data/products.json');

const PORT = 3001;
const accessTokens = [];

const router = Router();
router.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  router(request, response, finalHandler(request, response))
}).listen(PORT);

router.get("/brands", (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(Brands))
});

router.get("/sunglasses/search", (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(Products))
})

myRouter.post('/user/login', (req, res) => {
  if (req.body.username && req.body.password) {

    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      
      response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));

      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }

  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

module.exports = server;