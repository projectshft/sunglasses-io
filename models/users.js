const fs = require('fs');
const Product = require('./products.js');
let users = [];

class User {
  constructor(params) {
    Object.assign(this,params);
  }

  static load() {
    users = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
  }

  static get(userId) {
    return users.find((user=>user.id == userId));
  }

  static getCart(userId) {
    return users.find(user=>user.id == userId).cart;
  }

  static getAll() {
    return users;
  }

  static emptyCart(userId) {
    this.get(userId).cart.items = [];
    this.get(userId).cart.quantities = {};
  }

  static addCartItem(userId, productId, quantity=1) {
    const cart = users.find((user=>user.id == userId)).cart
    const product = Product.get(productId);
    const newProducts = [];
    for (let i = 0; i < quantity; i++) {
      newProducts.push(product);
    }
    cart.items = cart.items.concat(newProducts);
    cart.quantities[productId] =  cart.quantities[productId] === undefined ? quantity : cart.quantities[productId] + quantity;
    return newProducts;
  }

  static removeCartItem(userId, productId, quantity=1) {
    const cart = this.getCart(userId);
    const removedItems = [];

    if (cart.quantities[productId] === undefined) {
      cart.quantities[productId] = 0;
    } else {
      const newCart = cart.items.filter((item) => {
        if (item.id === productId && removedItems.length < quantity) {
          removedItems.push(item);
          return false;
        } 
        return true;
      })
      cart.items = newCart;
      cart.quantities[productId] = quantity < cart.quantities[productId] ? cart.quantities[productId] - quantity : 0;
    }

    return removedItems;
  }

  static updateItemQuantity(userId, productId, quantity) {
    const cart = this.getCart(userId);
    // clear out all the items, then add in the correct amount.
    cart.items = cart.items.filter((item) => {
      if (item.id === productId) {
        return false;
      }
      return true;
    })
    this.addCartItem(userId, productId, quantity);
    cart.quantities[productId] = quantity;
    return cart;
  }

  static save() {
    fs.writeFileSync('../data/users.json', JSON.stringify(users), 'utf-8');
  }
} 

module.exports = User;