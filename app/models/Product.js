let products = require('../../initial-data/products.json')

class Product {
  constructor(params){
    Object.assign(this, params)
  }

  static getProducts(){
    return products
  }


}

module.exports = Product