'use strict';


/**
 * All brands
 * Returns an array of available brands. 
 *
 * brandName String An array of brands
 * returns List
 **/
exports.brandsGET = function(brandName) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "brandName" : "brandName",
  "id" : 0
}, {
  "brandName" : "brandName",
  "id" : 0
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * All products for a given brand
 * Returns all products for a given brand. 
 *
 * id Long ID of brand
 * returns Object
 **/
exports.getProductsByBrand = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = "{}";
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

