const brands = [
  
    {
    "id": "1",
    "name" : "Oakley"
},
{
    "id": "2",
    "name" : "Ray Ban"
},
{
    "id": "3",
    "name" : "Levi's"
},
{
    "id": "4",
    "name" : "DKNY"
},
{
    "id": "5",
    "name" : "Burberry"
}


];
let productByBrand = [];
let brandId = 1;
let brandName = 'Oakley';
let categoryId = 1;


class Brand {
  constructor(params) {
    Object.assign(this, params);
  }

  static getBrands() {
    return brands.map((brand=>brand.name))
  }

  // static getAll() {
  //   return brands
  // }

  static getProductsByBrand(categoryId) {
    return brands.find((brand=>brand.id === categoryId))
  }
};

module.exports = Brand;
  