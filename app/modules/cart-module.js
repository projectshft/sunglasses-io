

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
  let indexOfProduct = user.cart.indexOf(productToAdd);

  if (indexOfProduct === -1) {
    productToAdd.quantity = 1;
    user.cart.push(productToAdd);
  } else {
    user.cart[indexOfProduct].quantity += 1;
  }
//  let foundProduct = user.cart.find(product => {
//    product.id == productToAdd.id
//  })

//  if (foundProduct) {
//    foundProduct.quantity++;
//  } else {
//    productToAdd.quantity = 1;
//    user.cart.push(productToAdd);
//  }
    return user;
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

    let product = user.cart.find((product => product.id == productId))
    product.quantity = newQuantity;

    return user.cart;
  }
}

module.exports = UserCart;