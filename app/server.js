const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config({ path: ".env.local" });
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml"); // Replace './swagger.yaml' with the path to your Swagger file
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

// token validator helper function

const tokenValidator = (authHeader) => {
  const token = authHeader.split(" ")[1];

  const verify = jwt.verify(token, process.env.SECRET_KEY);
  const username = verify.username;
  const user = users.find((user) => user.login.username === username);

  return user;
};

// End Points

app.get("/api/brands", function (request, response) {
  if (!brands) {
    response.writeHead(404);
    return response.end("Brand does not exist.");
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

app.get("/api/brands/:id/products", function (request, response) {
  const brandId = request.params.id;

  let filteredProducts = products.filter(
    (product) => product.categoryId === brandId,
  );

  if (filteredProducts.length === 0) {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ message: "products do not exist." }));
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(filteredProducts));
});

app.get("/api/products", function (request, response) {
  if (products.length === 0) {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ message: "No products available." }));
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

app.post("/api/login", function (request, response) {
  const { username, password } = request.body;

  if (!username || !password) {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(
      JSON.stringify({ message: "Please enter a username and or password." }),
    );
  }

  let user = users.find((user) => {
    return user.login.username === username;
  });

  if (!user) {
    response.writeHead(401, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ message: "User does not exist." }));
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password + user.login.salt)
    .digest("hex");

  if (hashedPassword !== user.login.sha256) {
    response.writeHead(401, { "Content-Type": "application/json" });
    return response.end();
  }

  if (user) {
    response.writeHead(200, { "Content-Type": "application/json" });

    const token = jwt.sign({ username: username }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    response.end(JSON.stringify({ token }));
  }
});

app.get("/api/me/cart", function (request, response) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    response.writeHead(401, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ error: "No token provided" }));
  }

  try {
    const user = tokenValidator(authHeader);

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(user.cart));
  } catch (err) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Invalid or expired token" }));
  }
});

app.post("/api/me/cart", function (request, response) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    response.writeHead(401, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ error: "No token provided" }));
  }

  try {
    const user = tokenValidator(authHeader);
    const { id } = request.body;
    const product = products.find((product) => product.id === id);

    if (!product) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(JSON.stringify({ error: "No product found." }));
    }

    const brand = brands.find((item) => item.id === product.categoryId);

    if (!brand) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(JSON.stringify({ error: "No brand found." }));
    }

    const cartItem = {
      id: product.id,
      brandName: brand.name,
      desciption: product.name,
      quantity: 1,
    };
    const cart = user.cart;
    const foundItem = cart.find((item) => item.id === cartItem.id);

    if (foundItem) {
      foundItem.quantity += 1;
    } else {
      cart.push(cartItem);
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(user.cart));
  } catch (err) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Invalid or expired token" }));
  }
});

app.delete("/api/me/cart/:productId", function (request, response) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    response.writeHead(401, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ error: "No token provided" }));
  }

  try {
    const user = tokenValidator(authHeader);
    let cart = user.cart;
    const { productId } = request.params;
    const deleteIndex = cart.findIndex((product) => product.id === productId);

    if (deleteIndex === -1) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(JSON.stringify({ error: "Product not in cart" }));
    }

    cart.splice(deleteIndex, 1);

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(cart));
  } catch (err) {
    console.log(err);
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Invalid or expired token" }));
  }
});

app.post("/api/me/cart/:productId", function (request, response) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    response.writeHead(401, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ error: "No token provided" }));
  }

  try {
    const user = tokenValidator(authHeader);
    let cart = user.cart;
    const { productId } = request.params;
    const { quantity } = request.body;
    const productIndex = cart.findIndex((product) => product.id === productId);

    if (productIndex === -1) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(JSON.stringify({ error: "Product not in cart" }));
    }

    if (!quantity || quantity < 1) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(JSON.stringify({ error: "Invalid quantity" }));
    }

    cart[productIndex].quantity = quantity;

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(cart));
  } catch (err) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Invalid or expired token" }));
  }
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
