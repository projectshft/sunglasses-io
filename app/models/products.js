let products = [];
let brands = [];

class Products {
  constructor(params) {
    Object.assign(this, params);
  };

  static addProducts(newProducts) {
    return products.push(...newProducts);
  };

  static getAllProducts() {
    return products;
  };

  static getProductById(id) {
      let foundProduct = products.find(product => product.id == id);
      return foundProduct;
  }

  static addBrands(newBrands) {
    brands = [...newBrands];
  };

  static getAllBrands() {
    return brands;
  }

  static filterProductsByBrand(_brand) {
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