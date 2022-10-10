'use strict';

var utils = require('../utils/writer.js');
var Brands = require('../service/BrandsService');

module.exports.getBrandProduct = function getBrandProduct (req, res, next) {
  var id = req.swagger.params['id'].value;
  Brands.getBrandProduct(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getBrands = function getBrands (req, res, next) {
  var query = req.swagger.params['query'].value;
  Brands.getBrands(query)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
