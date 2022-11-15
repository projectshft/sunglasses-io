let Brand = require('../models/brand');

function getBrands (req, res) {
  res.send(Brand.getAll())
};

function getProductsByBrand (req, res) {
  res.send(Brand.getProductsByBrand(req.params.categoryId))
};

module.exports = { getBrands, getProductsByBrand };