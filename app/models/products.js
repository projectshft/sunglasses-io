let products = [];
let currentId = 1;

class Product {
  constructor(params) {
    Object.assign(this,params);
  }

  static addProduct(newProduct) {
    newProduct.id = currentId;
    currentId++;
    products.push(newProduct)
    return newProduct;
  }

  static removeAll() {
    products = [];
  }

  static remove(productIdToRemove) {
    products = products.filter((product=>product.id != productIdToRemove))
  }

  static getProduct(productId) {
    return products.find((product=>product.id == productId))
  }

  static getAll() {
    return products
  }

  static updateProduct(updatedProduct) {
    let product = products.find((product=>product.id == updatedProduct.id))
    Object.assign(product, updatedProduct);
    return product;
  }
} 

//Exports the Book for use elsewhere.
module.exports = Product;