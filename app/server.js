// const express = require("express");
// const app = express();
let http = require("http");
let fs = require("fs");
const bodyParser = require("body-parser");
const finalHandler = require("finalhandler");
const Router = require("router");
// const jwt = require("jsonwebtoken");
const uid = require("rand-token").uid;
// const swaggerUi = require("swagger-ui-express");

// const YAML = require("yamljs");
// const swaggerDocument = YAML.load("./swagger.yaml");

const myRouter = Router();
myRouter.use(bodyParser.json());
const PORT = process.env.port || 2121;

// Importing the data from JSON files
let users = [];
// let brands = require("../initial-data/brands.json");
const brands = require("../initial-data/brands.json");
const products = require("../initial-data/products.json");
let signedInUser = {};

// UNABLE TO SERVE SWAGGER FILES DUE TO USING ROUTER AND HTTP INSTEAD OF EXPRESS FOR SERVER
// Swagger
// myRouter.use("/api-docs", () => {
//   swaggerUi.setup(swaggerDocument);
// });

// Starting the server
let server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // console.log(brands);
    // console.log(products);
  });

myRouter.get("/brands", (request, response) => {
  if (brands.length === 0) {
    response.writeHead(404);
    response.end("no brands found");
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brands));
  }
});

myRouter.get("/brands/:brandId/products", (request, response) => {
  // get all products from a particular brand
  // filter only products with brand id of :id
  let brandProducts = products.filter((product) => {
    return product.categoryId == request.params.brandId;
  });
  console.log(brandProducts);
  if (brandProducts.length < 1) {
    response.writeHead(404, "Brand with that id does not exist");
    response.end("Not a valid brand");
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brandProducts));
  }
});

myRouter.get("/products", (request, response) => {
  // parse the query from url  name = glasses
  // filter products by name to see if products includes the name used in query
  response.end("all products");
});
//actually a post
myRouter.get("/login", (request, response) => {
  response.end("login page");
});

myRouter.get("/me/cart", (request, response) => {
  response.end("cart");
});
//actually post
myRouter.get("/me/cart", (request, response) => {
  response.end("post to cart");
});
//actually a delete
myRouter.get("/me/cart/:productId", (request, response) => {
  response.end("delete from cart");
});

//actually a post
myRouter.get("/me/cart/:productId", (request, response) => {
  response.end("change quantity");
});

// Error handling
myRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
module.exports = server;
