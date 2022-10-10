'use strict';


/**
 * Add to cart
 * Add sunglasses to a cart 
 *
 * cart Cart The cart of products of a user
 * no response value expected for this operation
 **/
exports.addToCart = function(cart) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Change the quantity of products in a cart
 * Change the quantity of products  
 *
 * productId String The cart of products of a user
 * no response value expected for this operation
 **/
exports.changeQuantity = function(productId) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Delete an item from cart
 * This endpoint is for deleting a product based on its id
 *
 * productId String The cart of added sunglasses of a user
 * no response value expected for this operation
 **/
exports.deleteProductId = function(productId) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Cart of a user
 * Cart of an authorised user
 *
 * cart Cart The cart of added sunglasses of a user
 * no response value expected for this operation
 **/
exports.getCart = function(cart) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

