let brands = require('../../initial-data/brands.json')

class Brand {
  constructor(params){
    Object.assign(this, params)
  }

  static getBrands(){
    return brands
  }
}

module.exports = Brand