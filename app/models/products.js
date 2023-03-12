let products = [{
  id: "1",
  categoryId: "1",
  name: "super",
  description: "the best of the best",
  price: 300,
  imageUrl: ["www.image.com", "www.imageMore.com"]
}];

class Product {
  constructor(params) {
    Object.assign(this,params)
  }

  static getProducts() {
    return products;
  }
};

module.exports = Product;