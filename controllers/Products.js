'use strict';

var utils = require('../utils/writer.js');
var Products = require('../service/ProductsService');

module.exports.getProducts = function getProducts (req, res, next) {
  var query = req.swagger.params['query'].value;
  Products.getProducts(query)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
