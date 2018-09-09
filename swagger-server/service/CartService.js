'use strict';


/**
 * View a user's cart
 * The cart endpoint allows fetching of a user's cart.
 *
 * id String the id of the user's cart to retrieve
 * returns Cart
 **/
exports.getCart = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "quantity" : 0,
  "contents" : [ {
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
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Remove product from a user's cart
 * Remove a product from a user's cart 
 *
 * productId Long ID of a product to remove
 * returns Object
 **/
exports.meCartProductIdDELETE = function(productId) {
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


/**
 * Add product to a user's cart
 * Add a product to a user's cart 
 *
 * productId Long ID of a product to remove
 * returns Object
 **/
exports.meCartProductIdPOST = function(productId) {
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


/**
 * Add a user's cart
 * The cart post endpoint allows adding a user's cart.
 *
 * returns Cart
 **/
exports.postCart = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "quantity" : 0,
  "contents" : [ {
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
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

