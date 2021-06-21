const brandData = require("../initial-data/brands.json");

class Sunglasses {
  constructor(params) {
    Object.assign(this, params);
  }

  static getBrands() {
    return brandData;
  }
}

module.exports = Sunglasses;
