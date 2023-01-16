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
    token: "9DdyGguPUCVfw9hH",
    username: "lazywolf342",
  },
];

const PORT = 3001;
const Token_Timeout = 15 * 60 * 1000; 

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
//test 1
// test 1 (passing)
myRouter.get('/api/brands', (req, res) => {
  if(!brands) {
    res.writeHead(404, 'doesnt match any sunglass brands');
    return res.end();
  } else {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brands));
  }
})
//test 2 (passing)
myRouter.get("/api/products", function (req, res) {
  if(!products) {
    res.writeHead(404, 'did not match any products');
    return res.end();
  } else {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(products));
  }
});


//test 3 (passing)
myRouter.get('/api/brands/:id/products', (req, res) => {
  let returnProducts = products.filter(
    (product) => product.categoryId === req.params.id
  );
  if (returnProducts.length === 0) {
    res.writeHead(404, 'does not match any brands');
    return res.end();
  } else {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(returnProducts));
}});


//test 4 (passing)
myRouter.post("/api/login", (request, response) => {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });
      let currentAccessToken = accessTokens.find((tokenUser) => {
        return tokenUser.username == user.login.username;
      });
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          token: uid(16),
          lastUpdated: new Date(),
        };
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    response.writeHead(400, "invalid request");
    return response.end();
  }
});


//function after login for token
const getTokenRequest = function(request) {
  const parsedUrl = require("url").parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == parsedUrl.query.accessToken &&
        new Date() - accessToken.lastUpdated < Token_Timeout
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


//test 5 (passing)
myRouter.get("/api/me/cart", (request, response) => {
  let currentAccessToken = getTokenRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "cannot access cart");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    if (!user) {
      response.writeHead(401, "You're not signed in");
      return response.end();
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
    }
  }
});


//test 6 (passing)
myRouter.post("/api/me/cart", (request, response) => {
  let currentAccessToken = getTokenRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "cannot access cart");
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


//test 7 (passing)
myRouter.delete("/api/me/cart/:productId", (request, response) => {
  let currentAccessToken = getTokenRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "cannot access cart");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    const { productId } = request.params;
    user.cart.filter((cart) => cart.id != productId);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});


//test 8 (passing)
myRouter.post("/api/me/cart/:productId", (request, response) => {
  let currentAccessToken = getTokenRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "cannot access cart");
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
      response.writeHead(404, "cannot find product");
      return response.end();
    } else {
      user.cart.push(product);
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

module.exports = server;