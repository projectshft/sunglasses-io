let products = [];
let currentId = 1;

class Product {
  constructor(params) {
    Object.assign(this, params);
  }

  static addProduct(newBrand) {
    newProduct.id = currentId;
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