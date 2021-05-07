var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var querystring = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;

let brands = [];
let products = [];
let users = [];
let accessTokens = [];

const newAccessToken = uid(16);
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

const router = Router();
router.use(bodyParser.json());

const server = http.createServer((request, response) => {
  response.writeHead(200);
  router(request, response, finalHandler(request, response));
});

server.listen(3001, err => {
  if (err) throw err;
  console.log("server running on port 3001");

  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
  user = users[0];
});

router.get("/v1/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  let brandsToReturn = [];
  if (query !== undefined) {
    brandsToReturn = brands.filter(brand =>
      brand.name.includes(query)

    );
    if (!brandsToReturn) {
      response.writeHead(404, "There aren't any brands to return");
      return response.end();
    }
  } else {
    brandsToReturn = brands;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
});

router.get("/v1/brands/:brandId/products", (request, response) => {
  const { brandId } = request.params;
  const brand = brands.find(brand => brand.id == brandId);
  if (!brand) {
    response.writeHead(404, "That brand does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedProducts = products.filter(
    product => product.brandId === brandId
  );
  return response.end(JSON.stringify(relatedProducts));
});

router.get("/v1/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  let productsToReturn = [];
  if (query !== undefined) {
    productsToReturn = products.filter(product =>
      product.description.includes(query)

    );
    if (!productsToReturn) {
      response.writeHead(404, "There aren't any products to return");
      return response.end();
    }
  } else {
    productsToReturn = products;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

router.post("/v1/login", (request, response) => {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      let currentAccessToken = accessTokens.find((token) => {
        return token.username == user.login.username;
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

    response.writeHead(400, "Incorrectly formatted inputs");
    return response.end();
  }
})

// var getValidTokenFromRequest = function (request) {
//   var parsedUrl = require('url').parse(request.url, true);

//   if (parsedUrl.query.accessToken) {
//     let currentAccessToken = accessTokens.find((accessToken) => {
//       return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
//     });

//     if (currentAccessToken) {
//       return currentAccessToken;
//     } else {
//       return null;
//     }
//   } else {
//     return null;
//   }
// };

router.get("/v1/me/cart", (request, response) => {
  if (!user) {
    response.writeHead(401, "The user does not exist");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(user.cart));
  }
})

router.post("/v1/me/cart", (request, response) => {
  let product = products[0]
  // if (!product) {
  //   response.writeHead(404, "That product does not exist!");
  //   return response.end();
  // }
  response.writeHead(200);
  user.cart.push(product);
  return response.end();
});
module.exports = server;