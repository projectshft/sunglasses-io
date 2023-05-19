let products = []
let users = []
let brands = []


class Sunglasses {
  constructor(params) {
    Object.assign(this, params);
  }

  static setState(state) {
    products = state.products
    users = state.users
    brands = state.brands
  }

  static getAllBrands() {  
    console.log(`brands: ${brands}`)
    return brands;
  };
  
}


module.exports = Sunglasses;