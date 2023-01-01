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
    if(!brandObject){
      return undefined;
    }
    const filteredProducts = products.filter((product) => product.categoryId === brandObject.id);
    return filteredProducts;
  }
};

//Exports the product for use elsewhere
module.exports = Products;