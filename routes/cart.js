let Cart = require('../models/cart');

function getCart(req, res) {
  res.send(Cart.getAll())
}

// need to check this function.  Example from bookstore-test is POST mine needs to be PUT
function addToCart(req, res) {
  let newItem = new Cart(req.body);
  Cart.addToCart(newItem)
  res.send(newItem)
}

function getCart (req, res) {
  res.send(Cart.getCart(req.params.id));
};

function deleteFromCart(req, res) {
  Cart.removeFromCart(req.params.id)
  res.send(true);
};

function updateCart(req, res) {
  res.send(Cart.updateCart(req.body));
};

module.exports = Cart;
