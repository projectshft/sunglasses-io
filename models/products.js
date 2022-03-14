const fs = require('fs');
let products = [];

class Product {
  constructor(params) {
    Object.assign(this,params);
  }

  static load() {
    products = JSON.parse(fs.readFileSync('../data/products.json', 'utf-8'));
  }

  static get(sunglassesId) {
    return products.find((product=>product.id == sunglassesId));
  }

  static getAll() {
    return products;
  }
} 

module.exports = Product;