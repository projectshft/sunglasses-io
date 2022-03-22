// OKAY SO NOT SURE IF I NEED ANYTHING OTHER THAN getALL

var fs = require('fs');

let brands = [];

fs.readFile("/Users/StephB/code/node-js/sunglasses-io/initial-data/brands.json", "utf8", (error, data) => {
  if (error) throw error;
  brands = JSON.parse(data);
  console.log(`Server setup: ${brands.length} stores loaded`);
});

let currentId = brands.length + 1;

class Brand {
  constructor(params) {
    Object.assign(this.params);
  }

  static addBrand(newBrand) {
    newBrand.id = currentId;
    currentId++;
    brand.push(newBrand)
    return newBrand;
  }

  static removeAll() {
    brands = [];
    currentId = 1
  }

  static remove(brandIdToRemove) {
    brands = brands.filter((brand=>brand.id != brandIdToRemove))
  }

  static getBrand(brandId) {
    return brands.find((brand=>brand.id == brandId))
  }

  // using
  static getAll() {
    return brands
  }

  static updateBrand(brand, updatedBrand) {
    Object.assign(brand, updatedBrand);
    return brand;
  }
} 

//Exports the Product for use elsewhere.
module.exports = Brand;
