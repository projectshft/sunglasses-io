const brandData = require("../initial-data/brands.json");
const productData = require("../initial-data/products.json");

class Sunglasses {
  constructor(params) {
    Object.assign(this, params);
  }

  static getBrands() {
    return brandData;
  }

  static getBrandProducts(brandProducts) {
    return brandProducts;
  }

  static getProducts(query) {
    const relatedProducts = productData.filter((product) => {
      return (
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.name.toLowerCase().includes(query.toLowerCase())
      );
    });
    return relatedProducts;
  }

  static getCart(userData) {
    let cart = userData.cart;
    return cart;
  }

  static addProduct(product, cart) {
    if (Array.isArray(cart) && !cart.length) {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
      return cart;
    } else {
      let matchedItem = cart.find((item) => {
        return item.id === product.id;
      });
      if (matchedItem) {
        matchedItem.quantity++;
        return cart;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        });
        return cart;
      }
    }
  }
}

module.exports = Sunglasses;
