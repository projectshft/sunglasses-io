const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const url = require("url");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;

const PORT = 3001;

// State holding variables
let products = [];
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
  //load data
  products = JSON.parse(
    fs.readFileSync("./initial-data/products.json", "utf-8")
  );

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
        // new token if no currentAccessToken present
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

//products
myRouter.get("/api/products", function (request, response) {
  //query params from query string
  const queryParams = queryString.parse(url.parse(request.url).query);
  let productsToReturn = [];

  if (!queryParams.query) {
    response.writeHead(400, "Bad request.");
    return response.end("No product searched.");
  }

  productsToReturn = products.filter((product) => {
    let filteredProduct;
    if (
      product.name.toLowerCase() === queryParams.query.toLowerCase() ||
      product.description
        .toLowerCase()
        .includes(queryParams.query.toLowerCase())
    ) {
      filteredProduct = product;
    }
    return filteredProduct;
  });

  if (productsToReturn.length === 0) {
    response.writeHead(404, "No products found.");
    return response.end("No product by that name found.");
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

  if (brandProduct) {
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

//helper methods for user cart routes
const checkForToken = (request) => {
  let token = accessTokens.find((accessToken) => {
    return accessToken.token === request.headers.access_token;
  });
  return token;
};

const checkForUser = (token) => {
  let user = users.find((user) => {
    return token.username === user.login.username;
  });
  return user;
};

//user
myRouter.get("/api/me", function (request, response) {
  let token = checkForToken(request);

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let user = checkForUser(token);

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user));
});

//user cart
myRouter.get("/api/me/cart", function (request, response) {
  let token = checkForToken(request);

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let user = checkForUser(token);

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

myRouter.post("/api/me/cart", function (request, response) {
  let token = checkForToken(request);

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let product = request.body;

  if (
    !product.id ||
    !product.categoryId ||
    !product.name ||
    !product.description ||
    !product.price ||
    !product.imageUrls
  ) {
    response.writeHead(400, "Bad request");
    return response.end("Bad request");
  }

  let user = checkForUser(token);

  user.cart.push(product);

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

myRouter.post("/api/me/cart/:productId", function (request, response) {
  let token = checkForToken(request);

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let product = products.find((p) => {
    return p.id === request.params.productId;
  });

  let user = checkForUser(token);

  let productInCart = user.cart.find((p) => {
    return p.id === product.id;
  });

  if (!productInCart) {
    response.writeHead(400);
    return response.end("You must add product to cart to increase quantity.");
  }

  if (productInCart) {
    user.cart.push(product);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

myRouter.delete("/api/me/cart/:productId", function (request, response) {
  let token = checkForToken(request);

  if (!token) {
    response.writeHead(403, "Not authorized.");
    response.end("You must be logged in to access cart.");
  }

  let user = checkForUser(token);

  let productIndex = user.cart.findIndex(
    (product) => product.id === request.params.productId
  );

  user.cart.splice(productIndex, 1);

  if (productIndex === -1) {
    response.writeHead(400, "No product Id found.");
    return response.end("No sunglasses with that Id found in your cart.");
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

module.exports = server;
