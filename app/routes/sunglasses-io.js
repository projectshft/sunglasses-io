let Sunglasses = require("../models/sunglasses-io");

function getBrands(request, response) {
  response.send(Sunglasses.getBrands());
}

function getBrandProducts(request, response) {
  response.send(Sunglasses.getBrandProducts());
}

function getProducts(request, response) {
  response.send(Sunglasses.getProducts());
}

function getCart(request, response) {
  response.send(Sunglasses.getCart());
}

function addProduct(request, response) {
  response.send(Sunglasses.addProduct());
}

function deleteProduct(request, response) {
  response.send(Sunglasses.deleteProduct());
}

function updateProduct(request, response) {
  response.send(Sunglasses.updateProduct());
}

module.exports = {
  getBrands,
  getProducts,
  getBrandProducts,
  getCart,
  addProduct,
  deleteProduct,
  updateProduct,
};
