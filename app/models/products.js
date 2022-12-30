let products = [];

class Products {
  constructor(params) {
    Object.assign(this, params);
  };

  static addProducts(newProducts) {
    newProducts.forEach((product) => products.push(product));
  };

  static getAll() {
    return products
  };
};

//Exports the product for use elsewhere
module.exports = Products;