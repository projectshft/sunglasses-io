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
let user = {};
let users = [];
let brands = [];

const VALID_API_KEYS = [
  "88312679-04c9-4351-85ce-3ed75293b449",
  "1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept, X-Authentication",
};

//setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  //preflight
  if (request.method === "OPTIONS") {
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }

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
  //current user will be user[0] initially
  user = users[0];
  //load all categories
  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));

  console.log("Server is running.");
  console.log(`${products.length} sunglasses loaded.`);
  console.log(`${users.length} users loaded.`);
  console.log(`${brands.length} brands loaded.`);
});

//sunglasses
myRouter.get("/", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });

  return response.end(JSON.stringify(products));
});

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

//user--me
myRouter.get("/api/me/cart", function (request, response) {
  if (!user) {
    response.writeHead(404, "No user found.");
    response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user));
});

myRouter.post("/api/me/:id/cart", function (request, response) {
  let product = products.find((p) => {
    return p.id === request.params.id;
  });

  if (!product) {
    response.writeHead(400, "No product Id found.");
    return response.end("No sunglasses with that Id found.");
  }

  //if product
  user.cart.push(product);
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user));
});

module.exports = server;
