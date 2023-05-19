

class Sunglasses {
  constructor(params) {
    Object.assign(this, params);
  };

  static getAllBrands(state) {
    return state.brands;
  }

  
}

module.exports = Sunglasses;