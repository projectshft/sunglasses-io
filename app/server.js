var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const PORT = 3001;
const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication" };


const myRouter = Router();
myRouter.use(bodyParser.json());

// State holding variables 
let brands = [];
let users = [];
let products = [];
let accessTokens = [];

// Set up server
const server = http.createServer(function (request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }
  //   const requestToken = request.headers['x-authentication'];
  //   if (!validateToken(requestToken)) {
  //     response.writeHead(401, "Unauthorized ")
  //     return response.end();
  // }
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, (error) => {
  if (error) {
    throw error
  }
  fs.readFile('../initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data)
    console.log(`Server setup: ${brands.length} brands loaded`)
  })
  fs.readFile('../initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data)
    console.log(`Server setup: ${products.length} products loaded`)
  })
  fs.readFile('../initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data)
    console.log(`Server setup: ${users.length} users loaded`)
  })
})

myRouter.get('/api/brands', function (request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' })
  return response.end(JSON.stringify(brands))
});

myRouter.get('/api/brands/{Id}/products', function (request, response) {
  const brandId = request.params.id;
  function getBrandById(id) {
    return brands.find(brand => brand.id === id)
  }
  const brand = getBrandById(brandId)
  if (brand) {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(brand))
  } else {
    response.writeHead(404, {'Content-Type' : 'application/json'})
    response.end(JSON.stringify({error: "Brand not found"}))
  }

});

// myRouter.get('/api/products', function (request, response) {
//   response.writeHead(200, { 'Content-Type': 'application/json' })
//   response.end(JSON.stringify(products))
// });

// myRouter.post('/api/login', function (request, response) {
//   if (request.body.username && request.body.password) {
//     let user = users.find((user) => {
//       return user.login.username == request.body.username && username.login.password === request.body.password
//     })
//     if (user) {
//       response.writeHead(200, { 'Content-Type': 'application/json' });
//       let currentAccessToken = accessTokens.find((tokenObj) => {
//         return tokenObj.username === user.login.username
//       })
//       if (currentAccessToken) {
//         currentAccessToken.lastUpdated = new Date();
//         return response.end(JSON.stringify(currentAccessToken.token));
//       } else {
//         let newAccessToken = {
//           username: user.login.username,
//           lastUpdated: new Date(),
//           token: uid(16)
//         }
//         accessTokens.push(newAccessToken);
//         return response.end(JSON.stringify(newAccessToken.token))
//       }
//     }
//   }
// })
module.exports = server;