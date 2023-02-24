const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

// State holding variables
let products = [];
let brands = [];
let product = {};
let user = {};
let cart = [];
let accessTokens = [];
console.log(accessTokens)
const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  // Load data from server
  products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));

  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));

  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
});

myRouter.get('/v1/brands', (request, response) => {
  if(!brands) {
    response.writeHead(404, "There are no brands to return");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(brands));
  }
});

myRouter.get('/v1/brands/:id/products', (request, response) => {
  // Find brand by id
  let brand = brands.find((brand) => {
    return brand.id == request.params.id
  })
  // Filter out products that are not from that brand
  let brandProducts = products.filter(p => p.brandId === brand.id);
  if(!brandProducts) {
    response.writeHead(404, "There are no products to return");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(brandProducts));
  }
});

myRouter.get('/v1/products', (request, response) => {
  if(!products) {
    response.writeHead(404, "There are no products to return");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(products));
  }
});

myRouter.post('/v1/login', (request, response) => {
  if(request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if(user) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify(user));
      
      // Check to see if there is an existing access token for the user.  If so, use that token.
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Check to see if access token is current
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Otherwise, create a new token for the user
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token))
      }
    } else {
      response.writeHead(401, "Invalid username of password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted request");
    return response.end();
  }
})


module.exports = server