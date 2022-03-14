const fs = require('fs');
const Product = require('products.js');
let users = [];

class User {
  constructor(params) {
    Object.assign(this,params);
  }

  static load() {
    users = JSON.parse(fs.readFileSync('../data/users.json', 'utf-8'));
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
    const counter = 0;
    const removedItems = [];
    const newCart = cart.items.filter((item) => {
      if (item.id === productId && counter < quantity) {
        removedItems.push(item);
        counter ++;
        return false;
      } 
      return true;
    })
    cart.items = newCart;
    cart.quantities[productId] = cart.quantities[productId] === undefined ? quantity : cart.quantities[productId] - quantity;
    return removedItems;
  }

  static updateItemQuantity(userId, productId, quantity) {
    const cart = this.getCart(userId);
    
  }

  static save() {
    fs.writeFileSync('../data/users.json', JSON.stringify(users), 'utf-8');
  }
} 

module.exports = User;