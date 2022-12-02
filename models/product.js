let products = [];
let currentProductId = 1;

class Product {
  constructor(params) {
    Object.assign(this, params);
  }

  static getProducts(productId) {
    return products.find((product=>product.id === productId))
  }

  static getAll() {
    return products
  }
}

module.exports = Product;
  