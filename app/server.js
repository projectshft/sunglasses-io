var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;

const PORT = 8001;

let accessTokens = [
  {
    username: "lazywolf342",
    password: "tucker",
    accessToken: "kmQWrczyuEkRE6VV",
  },
];

var myRouter = Router();
myRouter.use(bodyParser.json());

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept, X-Authentication",
};

const server = http
  .createServer(function (request, response) {
    if (request.method === "OPTIONS") {
      response.writeHead(200, CORS_HEADERS);
    }
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    if (error) {
      return console.log("Error on Server Startup", error);
    } else {
      console.log(`listening on port ${PORT} `);
    }
    fs.readFile("brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile("products.json", "utf8", (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });
    fs.readFile("users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });
  });

myRouter.get("/api/products", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

myRouter.get("/api/products/:id", (request, response) => {
  try {
    const productId = request.params.id;
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new Error("Product not found.");
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(product));
  } catch (error) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

myRouter.get("/api/brands", (request, response) => {
  response.writeHead(
    200,
    Object.assign(CORS_HEADERS, { "Content-Type": "application/json" })
  );
  return response.end(JSON.stringify(brands));
});

myRouter.get("/api/brands/:id/products", (request, response) => {
  try {
    const brandId = request.params.id;
    const brandItem = products.find((item) => item.categoryId === brandId);
    if (!brandItem) {
      throw new Error("Brand does not exist");
    }
    const searchedBrand = products.filter(
      (item) => item.categoryId === brandId
    );
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(searchedBrand));
  } catch (error) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

myRouter.post("/api/login", (request, response) => {
  try {
    const user = users.find(
      (user) =>
        user.login.username === request.body.username &&
        user.login.password === request.body.password
    );

    if (!user) {
      throw new Error("User not found.");
    }
    let newAccessToken = {
      username: user.login.username,
      password: user.login.password,
      accessToken: uid(16),
    };
    accessTokens.push(newAccessToken);
    // console.log(accessTokens);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(newAccessToken.accessToken));
  } catch (error) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

// These end-points require authentication.

myRouter.get("/api/me/cart", (request, response) => {
  try {
    const accessToken = request.headers["access-token"];
    const accountLogin = accessTokens.find(
      (code) => code.accessToken === accessToken
    );

    if (!accountLogin) {
      throw new Error("Please login to view cart contents.");
    }

    const currentUser = users.find(
      (item) => item.login.username === accountLogin.username
    );

    response.writeHead(
      200,
      Object.assign(CORS_HEADERS, { "Content-Type": "application/json" })
    );
    return response.end(JSON.stringify(currentUser.cart));
  } catch (error) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

myRouter.post("/api/me/cart/:productId", (request, response) => {
  try {
    const productId = request.params.productId;
    const accessToken = request.headers["access-token"];
    const accountLogin = accessTokens.find(
      (code) => code.accessToken === accessToken
    );
    if (!accountLogin) {
      throw new Error("Please login to add to cart.");
    }
    const currentUser = users.find(
      (item) => item.login.username === accountLogin.username
    );
    const product = products.find((product) => product.id === productId);
    if (!product) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Product not in inventory." }));
      return;
    }
    currentUser.cart.push(product);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(currentUser.cart));
  } catch (error) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

myRouter.delete("/api/me/cart/:cartItemId", (request, response) => {
  try {
    const cartItemId = request.params.cartItemId;
    const accessToken = request.headers["access-token"];
    const accountLogin = accessTokens.find(
      (code) => code.accessToken === accessToken
    );
    if (!accountLogin) {
      throw new Error("Please login to edit cart.");
    }
    const currentUser = users.find(
      (item) => item.login.username === accountLogin.username
    );
    const product = currentUser.cart.find(
      (product) => product.id === cartItemId
    );
    if (!product) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Not a product in cart." }));
      return;
    }
    currentUser.cart = currentUser.cart.filter(
      (cartItem) => cartItem.id !== cartItemId
    );
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(currentUser.cart));
  } catch (error) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

module.exports = server;
