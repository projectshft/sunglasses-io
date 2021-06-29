let Sunglasses = require("../models/sunglasses-io");

function getBrands(request, response) {
  response.send(Sunglasses.getBrands());
}

function getBrandProducts(request, response) {
  response.send(Sunglasses.getBrandProducts());
}

function getAllProducts(request, response) {
  response.send(Sunglasses.getAllProducts());
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
  getBrandProducts,
  getAllProducts,
  getProducts,
  getCart,
  addProduct,
  deleteProduct,
  updateProduct,
};
