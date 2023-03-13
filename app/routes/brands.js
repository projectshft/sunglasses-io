let Brands = require("../models/brands");

function getAllBrands(req, res) {
  res.send(Brands.getAll());
};

module.exports = {getAllBrands};