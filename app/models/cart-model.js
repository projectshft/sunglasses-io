

class UserCart {
  constructor(params) {
    Object.assign(this,params)
  }

  //for get request to show all items in cart
  static getEntireCart(user) {
    return user.cart;
  }

  //for post request to add a product to the cart
  static addProduct(productToAdd, user) {
    productToAdd.quantity = 1;
    user.cart.push(productToAdd);
    return user.cart;
  }

  //for delete request to remove product from the cart
  static deleteProduct(productId, user) {
    user.cart = user.cart.filter(product => productId != product.id)
    return user.cart;
  }

  //for clearing the cart during testing
  static removeAllProductsFromCart() {
    cart = [];
  }

  // for finding a product in the cart (either to check for its removal or to update it)
  static findProductInCart(productId, user) {
    return user.cart.find((product => product.id == productId))
  }

  //for post request to change the quantity of a product already in the cart
  static changeQuantityOfProduct(productId, newQuantity, user) {
    // const foundProduct = cart.find((product => product.id == productId))

    // foundProduct.quantity = newQuantity;
    // return foundProduct;

    let product = user.cart.find((product => product.id == productId))
    product.quantity = newQuantity;
    // Object.assign(product, updatedProduct);
    return user.cart;
  }
}

module.exports = UserCart;