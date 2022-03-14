const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));

class Product {
  constructor(params) {
    Object.assign(this, params);
  }

  static getAll() {
    return products;
  }
}

module.exports = Product;
