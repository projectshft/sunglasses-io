let Sunglasses = require("../models/sunglasses-io");

function getBrands(request, response) {
  response.send(Sunglasses.getBrands());
}

function getBrandProducts(request, response) {
  response.send("Get Brand Products Working!");
}

function getProducts(request, response) {
  response.send(Sunglasses.getProducts());
}

module.exports = { getBrands, getProducts, getBrandProducts };
