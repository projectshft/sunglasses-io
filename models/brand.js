let fs = require('fs');

fs.readFile('app/brands.json', 'utf8', function (error, data) {
  if (error) throw error;
  brands = JSON.parse(data);
});

fs.readFile('app/products.json', 'utf8', function (error, data) {
  if (error) throw error;
  products = JSON.parse(data);
});

let brands = null;

class Brand {
constructor(params) {
  Object.assign(this, params);
}

static getBrands() {
  return brands.map((brand=>brand.name))
}

static getProductsByBrand(categoryId) {
  return brands.find((brand=>brand.id=== categoryId))
  
}
};

module.exports = Brand;