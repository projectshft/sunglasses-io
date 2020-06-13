let cart = [];

class UserCart {
  constructor(params) {
    Object.assign(this,params)
  }

  //for get request to show all items in cart
  static getEntireCart() {
    return cart;
  }

  //for post request to add a product to the cart
  static addProduct(productToAdd) {
    productToAdd.quantity = 1;
    cart.push(productToAdd);
    return productToAdd;
  }

  //for delete request to remove product from the cart
  static deleteProduct(productId) {
    cart = cart.filter(product => productId != product.id)
  }

  //for clearing the cart during testing
  static removeAllProductsFromCart() {
    cart = [];
  }

  // for finding a product in the cart (either to check for its removal or to update it)
  static findProductInCart(productId) {
    return cart.find((product=>product.id == productId))
  }

  //for post request to change the quantity of a product already in the cart
  // static changeQuantityOfProduct(productId) {

  // }
}

module.exports = UserCart;