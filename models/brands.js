const fs = require('fs');
let brands = [];

class Brand {
  constructor(params) {
    Object.assign(this,params);
  }

  static load() {
    brands = JSON.parse(fs.readFileSync('data/brands.json', 'utf-8'));
  }

  static get(brandId) {
    return brands.find((brand=>brand.id == brandId));
  }

  static getAll() {
    return brands;
  }
} 

module.exports = Brand;