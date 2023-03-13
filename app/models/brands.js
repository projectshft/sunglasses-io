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

let matchString = [
  { 
    name: "one",
    numSt: "1"
  },
  // {
  //   name: "two",
  //   numSt: "2"
  // },
  // {
  //   name: "three",
  //   numSt: "3"
  // },
  // {
  //   name: "four",
  //   numSt: "4"
  // },
  // {
  //   name: "fourfour",
  //   numSt: "4"
  // },
  // {
  //   name: "toto",
  //   numSt: "2"
  // }
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

var getProduct = function (brands, product, parameter) {
  let myParam = parameter.toString();
  product.forEach(prod => {
   let myBrand = brands.find(e =>
     e.id === prod.categoryId);
     if (myBrand.id === myParam) {
       matches.push(myBrand.name)
       matches.push(prod.name)
     }
 })
}

getProduct(brandNames, matchProductId, 3)
console.log(matches)

class Brands {
  constructor(params) {
    Object.assign(this, params)
  }

  static getBrandId(brandId) {
    return brands.find((e => e.id==brand))
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