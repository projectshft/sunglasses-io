

class Brands {
  constructor(params) {
    Object.assign(this, params);
  }

  static getAllBrands(brandsArray) {
    return brandsArray;
  } 

  static removeAll() {
    brandsArray = [];
  }

  static getIdOfSearchedBrand(queryString, brandsArray) {
    const query = queryString.toLowerCase();
    let brandId;
    brandsArray.forEach(brand => {
      if (brand.name.toLowerCase().includes(query)) {
        brandId = brand.id
      }
    })
    return brandId;
  }
}

module.exports = Brands;

