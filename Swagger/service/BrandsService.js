'use strict';


/**
 * This endpoint allows you to get all the sunglasess of this brand based on its id 
 *
 * id String The id of the brand
 * returns List
 **/
exports.getBrandProduct = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Available brands for sunglasses
 * The Brands endpoint allows you to search based on a brand 
 *
 * query String Search query string
 * returns List
 **/
exports.getBrands = function(query) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

