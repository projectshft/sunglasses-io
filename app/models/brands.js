let brands = [];
let currentId = 1;

class Brands {
  constructor(params) {
    Object.assign(this, params)
  }

  static addBrand(newBrand) {
    newBrand.id = currentId;
    currentId++;
    brands.push(newBrand)
    return newBrand
  }

  static removeAll() {
    brands = [];
  }

  static remove(brandIdToRemove) {
    brands = brands.filter((brand=>brand.id != brandIdToRemove))
  }

  static getBrand(brandId) {
    return brands.find((brand=>brand.id == brandId))
  }

  static getAll() {
    return brands
  }

  static updateBrand(updatedBrand) {
    let brand = brands.find((brand=>brand.id == updatedBrand.id))
    Object.assign(brand, this.updateBrand);
    return brand;
  }
};

module.exports = Brands;