let brands = [{
  id: "1",
  name: "oakley"
}];

class Brand {
  constructor(params) {
    Object.assign(this,params)
  }

  static getAllBrands() {
    return brands;
  }
};

module.exports = Brand;