let brands = [];
let currentId = 1;

class Brand {
  constructor(params) {
    Object.assign(this,params);
  }

  static addBrand(newBrand) {
    newBrand.id = currentId;
    currentId++;
    brands.push(newBrand)
    return newBrand;
  }

  static removeAll() {
    brands = [];
  }

  static getBrand(brandId) {
    return brands.find((brand=>brand.id == brandId))
  }

  static getAll() {
    return brands
  }
} 

//Exports the Book for use elsewhere.
module.exports = Brand;