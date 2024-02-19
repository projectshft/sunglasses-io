let Products = require('../models/products');

function getProducts(req, res) {
  res.send(Products.getAll())
}

function postProduct (req, res) {
  let newProduct = new Products(req.body);
  Products.addProduct(newProduct)
  res.send(newProduct);
};

function getProduct (req, res) {
  res.send(Products.getProduct(req.params.id));
};

function deleteProduct (req, res) {
  Products.remove(req.params.id)
  res.send(true);
};

function updateProduct (req, res) {
  res.send(Products.updateProduct(req.body));
};

module.exports = { getProducts, postProduct, getProduct, deleteProduct, updateProduct };