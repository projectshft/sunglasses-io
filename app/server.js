const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const app = express();

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

app.get("/brands", (request, response) => {
  response.send(brands);
});

app.get("/products", (request, response) => {
  response.send(products);
});

app.get("/brands/:id/products", (request, response) => {
  // Get all products that match the brand id
  // The sample data provided has a categoryId property that aligns with the brand id numbers - I think it would be better named "brandId" but chose not to change the existing data
  const filteredProducts = products.filter((product) => {
    return product.categoryId == request.params.id;
  });

  if (filteredProducts.length === 0) {
    response.status(404);
    response.send({ message: "No products found" });
  } else {
    response.send(filteredProducts);
  }
});

app.post("/login", (request, response) => {
  const { username, password } = request.body;

  const user = users.find((user) => {
    return user.login.username == username && user.login.password == password;
  });

  if (!username || !password) {
    response.status(401);
    response.send({ message: "Both a username and password are required" });
  }

  if (user) {
    const token = jwt.sign({ user }, "secretKey", { expiresIn: "1hr" });
    response.set("authorization", `Bearer ${token}`);
    response.status(200);
    response.send(user);
  } else {
    response.status(401);
    response.send({ message: "Incorrect username or password" });
  }
});

const getAuthenticatedUser = (request) => {
  const authHeader = request.headers["authorization"];
  if (!authHeader) {
    return;
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, "secretKey");

  let authenticatedUser = users.find(
    (user) => user.login.username == decoded.user.login.username
  );
  return authenticatedUser;
};

app.get("/me/cart", (request, response) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    response.status(401);
    response.send({ message: "Authentication failed" });
  } else {
    response.status(200);
    response.send(user.cart);
  }
});

app.post("/me/cart", (request, response) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    response.status(401);
    response.send({ message: "Authentication failed" });
  }

  const product = products.find((product) => product.id == request.body.id);

  if (!product) {
    response.status(404);
    response.send({ message: "Product not found" });
  }

  user.cart.push(product);
  response.status(200);
  response.send(user.cart);
});

app.delete("/me/cart/:productId", (request, response) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    response.status(401);
    response.send({ message: "Authentication failed" });
  }

  const product = products.find(
    (product) => product.id == request.params.productId
  );

  if (!product) {
    response.status(404);
    response.send({ message: "Product not found" });
  }

  const productIndex = user.cart.indexOf(product);
  user.cart.splice(productIndex, 1);
  response.status(200);
  response.send(user.cart);
});

app.post("/me/cart/:productId", (request, response) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    response.status(401);
    response.send({ message: "Authentication failed" });
  }

  const product = products.find(
    (product) => product.id == request.params.productId
  );

  if (!product) {
    response.status(404);
    response.send({ message: "Product not found" });
  }

  // Something like an "amountInCart" property on each product would be much easier to update, but this is what I could get working with the provided data
  const currentAmount = user.cart.filter(
    (product) => product.id == request.params.productId
  ).length;
  const desiredAmount = request.body.amount;

  if (desiredAmount > currentAmount) {
    for (let i = currentAmount; i < desiredAmount; i++) {
      user.cart.push(product);
    }
  } else if (desiredAmount < currentAmount) {
    for (let i = desiredAmount; i < currentAmount; i++) {
      const productIndex = user.cart.indexOf(product);
      user.cart.splice(productIndex, 1);
    }
  }
  response.status(200);
  response.send(user.cart);
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
