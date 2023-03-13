let Brand = require("../models/brands");

function getBrands(req, res) {
  res.send(Brand.getAll());
};

module.exports = {getBrands};