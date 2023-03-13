let products = [];

class Product {
  constructor(params) {
    Object.assign(this,params)
  }

  static removeAll() {
    products = [];
  }

  static getAll() {
    return products;
  }
};

module.exports = Product;