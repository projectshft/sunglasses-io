const express = require("express");
const {
  getProducts,
  getProductsByBrand,
} = require("../controllers/products.controller.js");

const router = express.Router();

router.get("/products", getProducts);
router.get("/brands/:brandId/products", getProductsByBrand);

module.exports = router;
