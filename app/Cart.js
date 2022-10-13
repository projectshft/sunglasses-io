let cart = [];
let currentQuantity = 1;

class Cart {
  constructor(params) {
    Object.assign(this,params);
  }

  static addCart(newProduct) {
    newProduct.quantity = currentQuantity;
    currentQuantity++;
    cart.push(newProduct)
    return newProduct;
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


module.exports = Cart;
  