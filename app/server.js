const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const url = require("url");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;
const { report } = require("process");

const PORT = 3001;

// State holding variables
let products = [];
//let user = {};
let users = [];
let brands = [];
let accessTokens = [];

//setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  response.writeHead(200);
  myRouter(request, response, finalHandler(request, response));
});

server.listen(PORT, (error) => {
  if (error) {
    return console.log("Error on server startup:.", error);
  }
  //load data onto server
  products = JSON.parse(
    fs.readFileSync("./initial-data/products.json", "utf-8")
  );
  //load all users
  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));

  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));

  console.log("Server is running.");
  console.log(`${products.length} sunglasses loaded.`);
  console.log(`${users.length} users loaded.`);
  console.log(`${brands.length} brands loaded.`);
});

//login
myRouter.post("/api/login", (request, response) => {
  // username and password in request
  if (request.body.username && request.body.password) {
    // See if there is a user in users that has that username and password
    let currentUser = users.find((user) => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password
      );
    });

    if (currentUser) {
      // check for existing token
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == currentUser.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // new token with the user value and token
        let newAccessToken = {
          username: currentUser.login.username,
          lastUpdated: new Date(),
          token: uid(16),
        };

        accessTokens.push(newAccessToken);
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // incorrect password or username
      response.writeHead(401, "Invalid username or password");
      return response.end("Invalid username or password.");
    }
  } else {
    // incorrect formatting
    response.writeHead(400, "Incorrectly formatted response");
    return response.end("Bad request");
  }
});

//sunglasses
myRouter.get("/api/products", function (request, response) {
  //query params from query string
  const queryParams = queryString.parse(url.parse(request.url).query);
  let productsToReturn = [];

  productsToReturn = products.filter((product) => {
    return product.description.includes(queryParams.query);
  });

  if (productsToReturn.length === 0) {
    response.writeHead(404, "No sunglasses found.");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

//brands
myRouter.get("/api/brands", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get("/api/brands/:categoryId/products", function (request, response) {
  let brandProducts = [];

  let brandProduct = products.filter((p) => {
    return p.categoryId === request.params.categoryId;
  });

  if (brandProduct !== undefined) {
    brandProducts.push(brandProduct);
  }

  if (brandProducts.length === 0) {
    response.writeHead(404, "No sunglasses brand found.");
    response.end();
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brandProducts));
  }
});

//user
myRouter.get("/api/me", function (request, response) {
  let token = accessTokens.find((accessToken) => {
    return accessToken.token === request.headers.access_token;
  });

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let user = users.find((user) => {
    return token.username === user.login.username;
  });

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user));
});

//user cart
myRouter.get("/api/me/cart", function (request, response) {
  let token = accessTokens.find((accessToken) => {
    return accessToken.token === request.headers.access_token;
  });

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let user = users.find((user) => {
    return token.username === user.login.username;
  });

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

myRouter.post("/api/me/cart", function (request, response) {
  let token = accessTokens.find((accessToken) => {
    return accessToken.token === request.headers.access_token;
  });

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let product = request.body;

  if (!product.price) {
    response.writeHead(400);
    return response.end("Product has no price.");
  } else if (!product.name) {
    response.writeHead(400);
    return response.end("Product has no price.");
  }

  let user = users.find((user) => {
    return token.username === user.login.username;
  });

  user.cart.push(product);

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

//make this change quantity in cart
myRouter.post("/api/me/cart/:productId", function (request, response) {
  let token = accessTokens.find((accessToken) => {
    return accessToken.token === request.headers.access_token;
  });

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let product = products.find((p) => {
    return p.id === request.params.productId;
  });

  let user = users.find((user) => {
    return token.username === user.login.username;
  });

  let counter = 0;

  user.cart.forEach((p) => {
    if (p.id === product.id) {
      counter++;
    }
    return counter;
  });

  if (!counter) {
    response.writeHead(400, "Product not found.");
    return response.end("You must add product to cart to increase quantity.");
  }

  if (counter > 0) {
    user.cart.push(product);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

myRouter.delete("/api/me/cart/:productId", function (request, response) {
  let token = accessTokens.find((accessToken) => {
    return accessToken.token === request.headers.access_token;
  });

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let user = users.find((user) => {
    return token.username === user.login.username;
  });

  let cart = user.cart;

  let productToRemove = cart.findIndex(
    (product) => product.id === request.params.productId
  );

  cart.splice(productToRemove, 1);

  if (productToRemove === -1) {
    response.writeHead(400, "No product Id found.");
    return response.end("No sunglasses with that Id found in your cart.");
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cart));
});

module.exports = server;
