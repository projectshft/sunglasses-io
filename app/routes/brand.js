let Brand = require('../models/brand');

function getBrands(req, res) {
  res.send(Brand.getAll())
}

module.exports = { getBrands };
