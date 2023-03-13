let brands = [];
let products = [];

let brandNames = [
  {
    name: "oakley",
    id: "1"
  },
  {
    name: "rayban",
    id: "2"
  },
  {
    name: "smith",
    id: "3"
  },
  {
    name: "noName",
    id: "4"
  }
]

let matchProductId = [
  {
    name: "black shades",
    categoryId: "3"
  },
  {
    name: "blue shades",
    categoryId: "1"
  }
];
let matches = [];
var getProduct = function (brands, product) {
  product.forEach(prod => {
   let myBrand = brands.find(e =>
     e.id === prod.categoryId);
     if (myBrand) {
       matches.push(myBrand.name)
       matches.push(prod.name)
     }
 })
}

getProduct(brandNames, matchProductId);
console.log(matches);



class Brands {
  constructor(params) {
    Object.assign(this, params)
  }

  // static addBrand(newBrand) {
  //   newBrand.id = currentId;
  //   currentId++;
  //   brands.push(newBrand)
  //   return newBrand
  // }

  static removeAll() {
    brands = [];
  }

  static getProduct(brands, product) {
     product.forEach(prod => {
      let myBrand = brands.find(e =>
        e.id === prod.categoryId);
        if (myBrand) {
          matches.push(myBrand.name)
          matches.push(prod.name)
        }
    })
  }

  // static getBrand(brandId) {
  //   return brands.find((brand=>brand.id == brandId))
  // }

  static getAll() {
    return brands
  }

  // static updateBrand(updatedBrand) {
  //   let brand = brands.find((brand=>brand.id == updatedBrand.id))
  //   Object.assign(brand, this.updateBrand);
  //   return brand;
  // }
};



module.exports = Brands;