let Brand = require("../models/brands");

function getBrands(req, res) {
  res.send(Brand.getAll());
};

function getProductWithBrandId(req, res) {
  let brandId = Brand.getBrandId(req.params.id);
  let idString = brandId.toString;
  res.send()
}

module.exports = {getBrands, getProductWithBrandId};