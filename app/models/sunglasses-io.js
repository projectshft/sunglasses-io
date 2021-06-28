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

  static getProducts(query) {
    const relatedProducts = productData.filter((product) => {
      return (
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.name.toLowerCase().includes(query.toLowerCase())
      );
    });
    console.log(relatedProducts);
    return productData;
  }

  static getCart(userData) {
    let cart = userData.cart;
    return cart;
  }
}

module.exports = Sunglasses;
