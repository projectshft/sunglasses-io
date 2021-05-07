let brands = [];
let currentId = 1;

class Brand {
  constructor(params) {
    Object.assign(this,params);
  }

  static addBrands(newBrandsArr) {
    newBrandsArr.forEach(newBrand => {
      this.addBrand(newBrand);
    });
  }

  static addBrand(newBrand) {
    newBrand.id = currentId.toString();
    currentId++;
    brands.push(newBrand)
    return newBrand;
  }

  static removeAll() {
    brands = [];
  }

  static resetId() {
    currentId = 1;
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