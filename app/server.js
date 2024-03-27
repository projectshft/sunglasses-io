const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const YAML = require("js-yaml");
const swaggerDocument = YAML.load("./swagger.yaml"); // Replace './swagger.yaml' with the path to your Swagger file
const app = express();
const uid = require("node-uid");
app.use(bodyParser.json());

// Importing the data from JSON files
const users = require("../initial-data/users.json");
const brands = require("../initial-data/brands.json");
const products = require("../initial-data/products.json");
let tokens = ["3nAqNTvQr3n3eEDA", "WzA6j5mCsxwSZ2za"];

// GET /api/brands
app.get("/api/brands", (req, res) => {
  res.status(200).json(brands);
});

// GET /api/products
app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

// GET /api/brands/:id/products
app.get("/api/brands/:id/products", (req, res) => {
  const id = req.params.id;
  const product = products.find((product) => {
    return product.id == id;
  });
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).json({ message: "Product id not found." });
  }
});

// POST /api/login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Both fields need to be filled" });
  }

  const user = users.find(
    (user) => user.login.username == username && user.login.password == password
  );

  if (user) {
    let token = uid(16);
    user.login.token = token;
    tokens.push(token);
    return res.status(200).json({ message: "Login successful" });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// POST /api/me/cart
app.post("/api/me/cart", (req, res) => {
  const { userId } = req;
  const user = users.find((user) => user.id === userId);
  const { productId, quantity } = req.body;
  const product = products.find((product) => product.id === productId);

  if (!product) {
    user.cart.push({ productId, quantity });
    res.status(200).json({ message: "Product added to cart", user });
  } else {
    res.status(401).json({ message: "Product not found", user });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

// // POST /api/me/cart
// app.post("/api/me/cart", authenticate, (req, res) => {
//   const { userId } = req;
//   const user = users.find((user) => user.id === userId);
//   const { productId, quantity } = req.body;
//   const product = products.find((product) => product.id === productId);

//   if (!product) {
//     user.cart.push({ productId, quantity });
//     res.status(200).json({ message: "Product added to cart", user });
//   } else {
//     res.status(401).json({ message: "Product not found", user });
//   }
// });

// // DELETE /api/me/cart/:productId
// app.delete("/api/me/cart/:productId", authenticate, (req, res) => {
//   const { userId } = req;
//   const user = users.find((user) => user.id === userId);
//   const productId = req.params.productId;

//   user.cart = user.cart.filter((item) => item.productId !== productId);
//   res.status(200).json({ message: "Product removed from cart", user });
// });

// // POST /api/me/cart/:productId
// app.post();
// /////////////////////
