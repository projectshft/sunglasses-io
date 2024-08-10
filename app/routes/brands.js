const express = require('express');
const path = require('path');
const router = express.Router();

// Load data files using relative paths
const brands = require(path.join(__dirname, '../initial-data/brands.json'));
const products = require(path.join(__dirname, '../initial-data/products.json'));

// Get all brands
router.get('/', (req, res) => {
  res.json(brands);
});

// Get products by brand name
router.get('/:brandName/products', (req, res) => {
  const brandName = req.params.brandName.toLowerCase();
  const brand = brands.find(b => b.name.toLowerCase() === brandName);

  if (!brand) {
    return res.status(404).json({ message: 'Brand not found' });
  }

  const filteredProducts = products.filter(p => p.categoryId === brand.id);
  res.json(filteredProducts);
});

module.exports = router;