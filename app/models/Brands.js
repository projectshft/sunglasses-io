let brands = require('../../initial-data/brands.json')
let products = require('../../initial-data/products.json')

class Brand {
  constructor(params){
    Object.assign(this, params)
  }

  static getBrands(){
    return brands
  }

  static getProductsByBrandId(brandId){
    const productsByBrand = []
    products.filter((prod) => {
      if(prod.categoryId == brandId){
        productsByBrand.push(prod)
      }
    })
    return productsByBrand
  }
}

module.exports = Brand