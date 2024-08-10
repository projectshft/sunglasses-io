const express = require('express');
const router = express.Router();
const path = require('path');
const products = require('../initial-data/products.json');

// Search for glasses
router.get('/search', (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  res.json(filteredProducts);
});


module.exports = router;