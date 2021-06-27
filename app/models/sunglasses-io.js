const brandData = require("../initial-data/brands.json");
const productData = require("../initial-data/products.json");

class Sunglasses {
  constructor(params) {
    Object.assign(this, params);
  }

  static getBrands() {
    return brandData;
  }

  static getBrandProducts(brandProducts) {
    return brandProducts;
  }

  static getProducts() {
    return productData;
  }

  static getCart(userData) {
    let cart = userData.cart;
    return cart;
  }
}

module.exports = Sunglasses;
