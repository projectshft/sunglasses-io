'use strict';


/**
 * All products
 * Returns an array of available product types. 
 *
 * product String Product query
 * returns List
 **/
exports.productsGET = function(product) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "price" : 6,
  "imageUrl" : "imageUrl",
  "description" : "description",
  "id" : 0,
  "productName" : "productName"
}, {
  "price" : 6,
  "imageUrl" : "imageUrl",
  "description" : "description",
  "id" : 0,
  "productName" : "productName"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

