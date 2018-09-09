'use strict';

var utils = require('../utils/writer.js');
var Cart = require('../service/CartService');

module.exports.getCart = function getCart (req, res, next) {
  var id = req.swagger.params['id'].value;
  Cart.getCart(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.meCartProductIdDELETE = function meCartProductIdDELETE (req, res, next) {
  var productId = req.swagger.params['productId'].value;
  Cart.meCartProductIdDELETE(productId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.meCartProductIdPOST = function meCartProductIdPOST (req, res, next) {
  var productId = req.swagger.params['productId'].value;
  Cart.meCartProductIdPOST(productId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.postCart = function postCart (req, res, next) {
  Cart.postCart()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
