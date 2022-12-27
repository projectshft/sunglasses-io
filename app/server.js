var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;

const PORT = 8001;

let users = [];
let products = [];
let brands = [];
let cart = [
  {
    id: "4",
    categoryId: "2",
    name: "Better glasses",
    description: "The best glasses in the world",
    price: 1500,
    imageUrls: [
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
    ],
  },
  {
    id: "5",
    categoryId: "2",
    name: "Glasses",
    description: "The most normal glasses in the world",
    price: 150,
    imageUrls: [
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
    ],
  },
];
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

// Gives directions to access api.
myRouter.get("/", (request, response) => {
  response.writeHead(
    200,
    Object.assign({ "Content-Type": "application/json" })
  );
  response.end("There's nothing to see here, please visit /api/products");
});

// Gets list of products
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

// Gets list of brands
myRouter.get("/api/brands", (request, response) => {
  response.writeHead(
    200,
    Object.assign(CORS_HEADERS, { "Content-Type": "application/json" })
  );
  return response.end(JSON.stringify(brands));
});

// needs to generate all items with brandId.
// Gets sunglasses products according to brand id.
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
      username: user.username,
      password: user.password,
      accessToken: uid(16),
    };
    accessTokens.push(newAccessToken);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(newAccessToken.accessToken));
  } catch (error) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

// Need to evaluate if user is logged in at this point.
myRouter.get("/api/me/cart", (request, response) => {
  try {
    const accessToken = request.headers["access-token"];
    const accountLogin = accessTokens.find(
      (code) => code.accessToken === accessToken
    );
    if (!accountLogin) {
      throw new Error("Please login to view cart contents.");
    }
    response.writeHead(
      200,
      Object.assign(CORS_HEADERS, { "Content-Type": "application/json" })
    );
    return response.end(JSON.stringify(cart));
  } catch (error) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

// delete item by id.
// User permission will be evaluated for this request.
myRouter.delete("/api/me/cart/:cartItemId", (request, response) => {
  try {
    const cartItemId = request.params.cartItemId;
    const accessToken = request.headers["access-token"];
    const accountLogin = accessTokens.find(
      (code) => code.accessToken === accessToken
    );
    if (!accountLogin) {
      throw new Error("Please login to view cart contents.");
    }

    const product = cart.find((product) => product.id === cartItemId);
    if (!product) {
      throw new Error("Not a product in cart.");
    }
    cart = cart.filter((cartItem) => cartItem.id !== cartItemId);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(cart));
  } catch (error) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

// User permission will be evaluated for this request.
myRouter.post("/api/me/cart/", (request, response) => {
  try {
    const productItem = request.body.productItem;
    const accessToken = request.headers["access-token"];
    const accountLogin = accessTokens.find(
      (code) => code.accessToken === accessToken
    );
    if (!accountLogin) {
      throw new Error("Please login to view cart contents.");
    }
    // This helper method will check the request body and
    const product = products.find((product) => product.id === productItem);
    if (!product) {
      throw new Error("Not a product.");
    }
    cart.push(product);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(cart));
  } catch (error) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: error.message }));
  }
});

module.exports = server;
