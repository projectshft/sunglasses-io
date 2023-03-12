let Brands = require('../models/brands');

function getBrands(req, res) {
  res.send(Brands.getAll());
};

module.exports = {getBrands};