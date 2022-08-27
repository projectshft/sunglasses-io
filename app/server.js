var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
const { access } = require("fs/promises");
var uid = require("rand-token").uid;

let brands = [];
let products = [];
let users = [];
let accessTokens = [
  // {
  //     username: user.login.username,
  //     lastUpdated: new Date(),
  //     token: uid(16),
  // }
];

const PORT = 3000;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
let myRouter = Router();
myRouter.use(bodyParser.json());

http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    console.log("Error on Server Startup: ", error);

    fs.readFile("../initial-data/brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });

    fs.readFile("../initial-data/products.json", "utf8", (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });

    fs.readFile("../initial-data/users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });

    console.log(`Server is listening on ${PORT}`);
  });

// GET /api/brands
myRouter.get("/api/brands", (request, response) => {
  //   const queryParams = queryString.parse(url.parse(request.url).query);  //??
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

// GET /api/brands/:id/products
myRouter.get("/api/brands/:id/products", (request, response) => {
  let brand = brands.find((brand) => {
    return brand.id == request.params.id;
  });

  if (!brand) {
    response.writeHead(404, "That brand can't be found");
    return response.end();
  } else {
    let productsAPI = products.filter(
      (product) => product.categoryId == request.params.id
    );

    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productsAPI));
  }
});

// GET /api/products
myRouter.get("/api/products", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

// POST /api/login
myRouter.post("/api/login", (request, response) => {
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password
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

// Helper method to process access token
const getValidTokenFromRequest = function (request) {
  const parsedUrl = require("url").parse(request.url, true);
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

// GET /api/me/cart
myRouter.get("/api/me/cart", (request, response) => {
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
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
    }
  }
});

// POST /api/me/cart
myRouter.post("/api/me/cart", (request, response) => {
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
    } else {
      user.cart = request.body;
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user));
    }
  }
});

// DELETE /api/me/cart/:productId
myRouter.delete("api/me/cart/:productId", (request, response) => {
  const { productId } = request.params;
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  } else {
    let product = products.find((product) => product.id == productId);
    if (!product) {
      response.writeHead(404, "That product can't be found");
      return response.end();
    }
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    if (!user) {
      response.writeHead(403, "You don't have access to the cart");
    } else {
      let user = user.cart.filter((c) => c.id != productId);
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
    }
  }
});

// POST /api/me/cart/:productId
myRouter.post("api/me/cart/:productId", (request, response) => {
  const { productId } = request.params;
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "You need to have access to this call to continue");
    return response.end();
  } else {
    let product = products.find((product) => product.id == productId);
    if (!product) {
      response.writeHead(404, "That product can't be found");
      return response.end();
    }
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    if (!user) {
      response.writeHead(403, "You don't have access to the cart");
    } else {
      user.cart.push(product);
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
    }
  }
});
