let products = [];
let brands = [];

class Products {
  constructor(params) {
    Object.assign(this, params);
  };

  static deleteBoth() {
    brands = [];
    products = [];
  }

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
};

//Exports the product for use elsewhere
module.exports = Products;