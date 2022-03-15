const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));

let cart = [];

class Cart {
  constructor(params) {
    Object.assign(this, params);
  }

  static clearCart() {
    cart = [];
  }

  static getCart() {
    return cart;
  }

  static addToCart(productId) {
    const productToAdd = products.find((product) => product.id === productId);
    cart.push(productToAdd);
  }

  static removeFromCart(productId) {
    cart = cart.filter((product) => product.id !== productId);
  }
}

module.exports = Cart;
