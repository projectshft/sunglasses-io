let Products = require('../models/brands');

function getAllProducts(req, res) {
  res.send(Products.getAll());
};

module.exports = {getAllProducts};