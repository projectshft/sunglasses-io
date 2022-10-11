'use strict';


/**
 * Sunglasses of a particular brand
 * This endpoint allows you to get a product based on the search input 
 *
 * query String Search query string
 * returns List
 **/
exports.getProducts = function(query) {
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

