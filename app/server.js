const express = require("express");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./sunglasses-api.yaml");
const router = express.Router();
require("dotenv").config();

const app = express();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const brandRoute = require("../routes/brands.route");
const productsRoute = require("../routes/products.Route");
const cartRoutes = require("../routes/cart.route");
const { login } = require("../controllers/auth.controller");

app.post("/api/login", login);
app.use("/api", brandRoute);
app.use("/api", productsRoute);
app.use("/api/me", cartRoutes);
app.use(router);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server connected. \nServer is now running on port: ${PORT}`);
});

server.on("error", (err) => {
  console.error(`Error starting server: ${err.message}`);
  process.exit(1);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;
