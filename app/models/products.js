let products = [];
let currentId = 1;

class Product {
  constructor(params) {
    Object.assign(this, params);
  }

  static addProducts(newProductsArr) {
    newProductsArr.forEach(newProduct => {
      this.addProduct(newProduct);
    });
  }

  static addProduct(newProduct) {
    newProduct.id = currentId.toString();
    currentId++;
    products.push(newProduct)
    return newProduct;
  }

  static removeAll() {
    products = [];
  }

  static resetId() {
    currentId = 1;
  }

  static getProduct(productId) {
    return products.find((product=>product.id == productId))
  }

  static getAll() {
    return products
  }
}

module.exports = Product;