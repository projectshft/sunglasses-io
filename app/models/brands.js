

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

var get = getProduct(brandNames, matchProductId, 1)
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

  static getProduct (brands, product, parameter) {
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

  static getAll() {
    return brands
  }

};



module.exports = Brands;