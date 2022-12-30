const fs = require('fs');

let products = [];
let brands = [];

class Products {
  constructor(params) {
    Object.assign(this, params);
  };

  static addProducts(newProducts) {
    newProducts.forEach((product) => products.push(product));
  };

  static getAllProducts() {
    return products;
  };

  static getProductsById(id) {
    return products.find(product => product.id = id);
  }

  static addBrands(newBrands) {
    newBrands.forEach((brand) => brands.push(brand));
  };

  static getAllBrands() {
    return brands;
  }

  static filterByBrand(_brand) {
    const brandObject = brands.find((brand) => brand.name === _brand );
    const filteredProducts = products.filter((product) => product.categoryId === brandObject.id);
    return filteredProducts;
  }
};

Products.addProducts(JSON.parse(fs.readFileSync("./initial-data/products.json","utf-8")));
Products.addBrands(JSON.parse(fs.readFileSync("./initial-data/brands.json","utf-8")));

//Exports the product for use elsewhere
module.exports = Products;