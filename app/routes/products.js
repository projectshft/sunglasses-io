let Products = require('../models/products');

function getProducts(req, res) {
  res.send(Products.getAll());
};

module.exports = {getAllProducts};