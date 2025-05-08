const express = require("express");
const {
  getCart,
  addToCart,
  removeFromCart,
  updateProductQuant,
} = require("../controllers/cart.controller");
const authenticateToken = require("../authenticationToken/authentication,");

const router = express.Router();

router.get("/cart", authenticateToken, getCart);
router.post("/cart", authenticateToken, addToCart);
router.delete("/cart/:productId", authenticateToken, removeFromCart);
router.post("/cart/:productId", updateProductQuant);

module.exports = router;
