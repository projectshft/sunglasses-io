const brandData = require("../initial-data/brands.json");
const productData = require("../initial-data/products.json");

class Sunglasses {
  constructor(params) {
    Object.assign(this, params);
  }

  static getBrands() {
    return brandData;
  }

  static foundBrandProducts(brandId) {
    let brandProducts = productData.filter((product) => {
      product.categoryId == brandId;
    });
    return brandProducts;
  }

  static getProducts() {
    return productData;
  }
}

module.exports = Sunglasses;
