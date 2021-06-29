const brandData = require("../initial-data/brands.json");
const productData = require("../initial-data/products.json");
const userData = require("../initial-data/users.json");

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

  static getAllProducts() {
    return productData;
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

  static getCart(username) {
    let user = userData.find((user) => user.login.username == username);
    let cart = user.cart;
    return cart;
  }

  static addProduct(product, cart) {
    if (Array.isArray(cart) && !cart.length) {
      cart.push({
        id: product.id,
        categoryId: product.categoryId,
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

  static deleteProduct(productId, userCart) {
    let itemToRemoveIndex = userCart.findIndex((item) => item.id === productId);
    userCart.splice(itemToRemoveIndex, 1);
    return userCart;
  }

  static updateProduct(productId, quantity, userCart) {
    let matchedItem = userCart.find((item) => {
      return item.id === productId;
    });
    matchedItem.quantity = quantity;
    return userCart;
  }
}

module.exports = Sunglasses;
