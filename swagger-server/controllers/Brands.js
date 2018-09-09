'use strict';

var utils = require('../utils/writer.js');
var Brands = require('../service/BrandsService');

module.exports.brandsGET = function brandsGET (req, res, next) {
  var brandName = req.swagger.params['brandName'].value;
  Brands.brandsGET(brandName)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getProductsByBrand = function getProductsByBrand (req, res, next) {
  var id = req.swagger.params['id'].value;
  Brands.getProductsByBrand(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
