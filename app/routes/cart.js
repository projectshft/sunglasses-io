const express = require('express');
const { body, query, validationResult } = require('express-validator');
const router = express.Router();
const jwt = require('jsonwebtoken');
const products = require('../initial-data/products.json');
let carts = {}; // In-memory storage for carts (userId -> cart)

// Middleware to check JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware to check for validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Get user's cart
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const cart = carts[userId] || [];
  res.json({ items: cart });
});

router.post(
  '/',
  authenticateToken,
  [
    body('productName').isString().withMessage('Product name must be a string'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    handleValidationErrors
  ],
  (req, res) => {
    const userId = req.user.id;
    const { productName, quantity } = req.body;

    // Find the product by name
    const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productId = product.id;

    if (!carts[userId]) {
      carts[userId] = [];
    }

    const existingItem = carts[userId].find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      carts[userId].push({ productId, quantity });
    }

    res.json({ items: carts[userId] });
  }
);


// Delete product from cart
router.delete(
  '/',
  authenticateToken,
  [
    query('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
    handleValidationErrors
  ],
  (req, res) => {
    const userId = req.user.id;
    const { productId } = req.query;

    if (!carts[userId]) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartIndex = carts[userId].findIndex(item => item.productId === productId);
    if (cartIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    carts[userId].splice(cartIndex, 1);
    res.json({ message: 'Product removed from cart' });
  }
);

// Change quantity of product in cart
router.patch(
  '/',
  authenticateToken,
  [
    body('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    handleValidationErrors
  ],
  (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!carts[userId]) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = carts[userId].find(item => item.productId === productId);
    if (!item) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    item.quantity = quantity;
    res.json({ message: 'Quantity updated' });
  }
);

module.exports = router;