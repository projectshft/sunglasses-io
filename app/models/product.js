// OKAY SO NOT SURE IF I NEED ANYTHING OTHER THAN getALL

var fs = require('fs');

let products = [];

fs.readFile("/Users/StephB/code/node-js/sunglasses-io/initial-data/products.json", "utf8", (error, data) => {
  if (error) throw error;
  products = JSON.parse(data);
  console.log(`Server setup: ${products.length} stores loaded`);
});

let currentId = products.length + 1;

class Product {
  constructor(params) {
    Object.assign(this.params);
  }

  static addProduct(newProduct) {
    newProduct.id = currentId;
    currentId++;
    product.push(newProduct)
    return newProduct;
  }

  static removeAll() {
    products = [];
    currentId = 1
  }

  static remove(productIdToRemove) {
    products = products.filter((product=>product.id != productIdToRemove))
  }

  static getProduct(productId) {
    return products.find((product=>product.id == productId))
  }

  // using
  static getAll() {
    return products
  }

  static updateProduct(product, updatedProduct) {
    Object.assign(product, updatedProduct);
    return product;
  }
} 

//Exports the Product for use elsewhere.
module.exports = Product;
