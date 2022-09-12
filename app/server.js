var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;

let brands = [];
let products = [];
let users = [];
let accessTokens = [
  {
    token: "OvlTCHSYPlM92Hg9",
    username: "yellowleopard753",
  },
];

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
    });
    fs.readFile("initial-data/users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
    });
    fs.readFile("initial-data/products.json", "utf-8", (error, data) => {
      products = JSON.parse(data);
    });
  });

myRouter.get("/v1/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get("/v1/brands/:brandId/products", (request, response) => {
  const { brandId } = request.params;
  let brand = brands.find((brand) => brand.id == brandId);
  if (!brand) {
    response.writeHead(404, "That brand is not currently in the store");
    return response.end();
  } else {
    let productList = products.filter(
      (product) => product.categoryId == brandId
    );
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productList));
  }
});

myRouter.get("/v1/products", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

myRouter.post("/v1/login", (request, response) => {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });
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
          token: uid(16),
        };
        accessTokens.push(newAccessToken);
        console.log(newAccessToken);
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

var getValidTokenFromRequest = function (request) {
  var parsedUrl = require("url").parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == parsedUrl.query.accessToken &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
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

myRouter.get("/v1/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    if (!user) {
      response.writeHead(403, "You don't have access to the cart");
      return response.end();
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
    }
  }
});

myRouter.post("/v1/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    user.cart.push(request.body);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

myRouter.delete("/v1/me/cart/:productId", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    const { productId } = request.params;
    user.cart.filter((c) => c.id != productId);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

myRouter.post("/v1/me/cart/:productId", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    let product = products.find((product) => {
      const { productId } = request.params;
      return product.id == productId;
    });
    if (!product) {
      response.writeHead(404, "That product can't be found");
      return response.end();
    } else {
      user.cart.push(product);
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

myRouter.get("/v1/teapot", (request, response) => {
  response.writeHead(418, "I'm a teapot");
  return response.end();
});

module.exports = server;
