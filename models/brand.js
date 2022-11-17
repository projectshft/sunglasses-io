let brands = [];
let productByBrand = [];
let brandId = 1;
let categoryId = 1;


class Brand {
  constructor(params) {
    Object.assign(this, params);
  }

  static getBrands(brandId) {
    return brands.find((brand=>brand.id === brandId))
  }

  static getAll() {
    return brands
  }

  static getProductsByBrand(categoryId) {
    return brands.find((brand=>brand.id === categoryId))
  }

}
  