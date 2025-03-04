const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const app = express();
require("dotenv").config();

// Using optional revealed key in case tester does not have .env file with secret key
const JWT_KEY = process.env.SECRET_KEY || "84345512";

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

app.use(bodyParser.json());

// Importing the data from JSON files
const users = require("../initial-data/users.json");
const brands = require("../initial-data/brands.json");
const products = require("../initial-data/products.json");

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Starting the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Routes
app.get("/api/brands", (req, res) => {
  res.status(200).json(brands);
});

app.get("/api/brands/:id/products", (req, res) => {
  const brandId = String(req.params.id);
  const filteredProducts = products.filter((product) => {
    const categoryId = String(product.categoryId);
    return categoryId === brandId;
  });
  res.status(200).json(filteredProducts);
});

app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

app.get("/api/me/cart", authenticate, (req, res) => {
  const cart = req.user.cart;
  return res.status(200).json(cart);
});

app.post("/api/login", (req, res) => {
  if (req.body.username && req.body.password) {
    const validUser = users.find((user) => {
      return (
        user.login.username === req.body.username &&
        user.login.password === req.body.password
      );
    });
    if (validUser) {
      const userIndex = users.findIndex(
        (user) => user.login.sha1 === validUser.login.sha1
      );
      const newAccessToken = jwt.sign(
        {
          username: validUser.login.username,
          cart: validUser.cart,
        },
        JWT_KEY,
        { expiresIn: "30m" }
      );
      users[userIndex].token = newAccessToken;
      res.status(200).json(newAccessToken);
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } else {
    res.status(400).json({ error: "Incorrectly formatted response" });
  }
});

app.post("/api/me/cart", authenticate, (req, res) => {
  const item = req.body;
  const cart = req.user.cart;
  item.quantity = 1;
  cart.push(item);
  res.status(200).json(cart);
});

app.post("/api/me/cart/:productId", authenticate, (req, res) => {
  const cart = req.user.cart;
  const newQuantity = req.body.quantity;
  const productId = req.params.productId;
  const itemToUpdate = cart.find((item) => item.id === productId);
  if (itemToUpdate) {
    itemToUpdate.quantity = newQuantity;
    res.status(200).json(itemToUpdate);
  } else {
    const productToAdd = products.find((item) => item.id === productId);
    productToAdd.quantity = newQuantity;
    cart.push(productToAdd);
    res.status(200).json(productToAdd);
  }
});

app.delete("/api/me/cart/:productId", authenticate, (req, res) => {
  let cart = req.user.cart;
  const productId = req.params.productId;
  const itemToRemove = cart.find((item) => item.id === productId);
  if (itemToRemove) {
    cart = cart.filter((item) => item.id != productId);
    res.status(200).json(cart);
  } else {
    res.status(200).json(cart);
  }
});

module.exports = app;
