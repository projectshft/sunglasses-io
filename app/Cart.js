let cart = [];
let currentId = 1;

class Cart {
  constructor(params) {
    Object.assign(this,params);
  }

  static addCart(newProduct) {
    newCart.id = currentId;
    currentId++;
    cart.push(newCart)
    return newCart;
  }

  static removeAll() {
    cart = [];
  }

  static remove(productIdToRemove) {
    cart = cart.filter((cart=>cart.id != productIdToRemove))
  }

  static getProduct(productId) {
    return cart.find((cart=>cart.id == productId))
  }

  static getAll() {
    return cart
  }

  static updateCart(pIdToUpdateQuantity, newQuantity) {
    let productToUpdate = cart.find((product=>product.id == pIdToUpdateQuantity.id))
    productToUpdate.quantity=newQuantity
    Object.assign(cart, productToUpdate);
    return cart;
  }
} 

//Exports the Cart for use elsewhere.
module.exports = Cart;
  