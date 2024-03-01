const express = require("express");
let http = require("http");
let fs = require("fs");
const bodyParser = require("body-parser");
const finalHandler = require("finalhandler");
const Router = require("router");
// const jwt = require("jsonwebtoken");
const uid = require("rand-token").uid;
const swaggerUi = require("swagger-ui-express");

const YAML = require("yamljs");
const swaggerDocument = YAML.load("swagger.yaml");
const app = express();
const myRouter = Router();
myRouter.use(bodyParser.json());
const PORT = process.env.port || 3000;

// Importing the data from JSON files
const users = require("../initial-data/users.json");
const brands = require("../initial-data/brands.json");
const products = require("../initial-data/products.json");

// // Error handling
// myRouter.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

// UNABLE TO SERVE SWAGGER FILES DUE TO USING ROUTER AND HTTP INSTEAD OF EXPRESS FOR SERVER
// Swagger
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Starting the server
http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

myRouter.get("/brands", (request, response) => {
  response.end("brands");
});

myRouter.get("/brands/:id/products", (request, response) => {
  response.end("products from a brand");
});

myRouter.get("/products", (request, response) => {
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

module.exports = app;
