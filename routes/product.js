let Product = require('../models/product');

function getProducts (req, res) {
  res.send(Product.getAll())
};

module.exports = { getProducts };