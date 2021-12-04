var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

// State holding variables
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

const PORT = 3001;

//setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  response.writeHead(200);
  router(request, response, finalHandler(request, response))

});

server.listen(PORT, error => {
  if (error) throw error;
  console.log(`server running on port ${PORT}`);
  
  //populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  
});

//GET api/products
router.get('/api/products', (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

//GET api/brands
router.get('/api/brands', (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

//GET api/brands/:brandId/products
router.get('/api/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;
  const brandToFilterBy = brands.find(brand => brand.id == brandId);
  if (!brandToFilterBy) {
    response.writeHead(404, "There are no products associated with that brand ID");
    return response.end();
  }
  
  response.writeHead(200, { "Content-Type": "application/json" });
  const filteredProducts = products.filter(
    products => products.categoryId === brandToFilterBy.id
  );
  
  return response.end(JSON.stringify(filteredProducts));
});

//POST api/login
router.post('/api/login', (request, response) => {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, {'Content-Type': 'application/json'});
      
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