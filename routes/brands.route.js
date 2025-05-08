const express = require("express");
const router = express.Router();
const {
  getBrands,
  getBrandProducts,
} = require("../controllers/brands.Controller");

router.get("/brands", getBrands);
router.get("/brands/:brandId/products", getBrandProducts);

module.exports = router;
