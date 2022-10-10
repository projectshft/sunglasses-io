'use strict';

var utils = require('../utils/writer.js');
var Cart = require('../service/CartService');

module.exports.addToCart = function addToCart (req, res, next) {
  var cart = req.swagger.params['cart'].value;
  Cart.addToCart(cart)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.changeQuantity = function changeQuantity (req, res, next) {
  var productId = req.swagger.params['productId'].value;
  Cart.changeQuantity(productId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteProductId = function deleteProductId (req, res, next) {
  var productId = req.swagger.params['productId'].value;
  Cart.deleteProductId(productId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getCart = function getCart (req, res, next) {
  var cart = req.swagger.params['cart'].value;
  Cart.getCart(cart)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
