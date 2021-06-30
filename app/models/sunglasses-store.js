const brandData = require("../initial-data/brands.json");
const productData = require("../initial-data/products.json");
const userData = require("../initial-data/users.json");

function getBrands() {
  return brandData;
}

function getBrandProducts(id) {
  return productData.filter((product) => product.categoryId == id);
}

function getAllProducts() {
  return productData;
}

function getProducts(query) {
  const relatedProducts = productData.filter((product) => {
    return (
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  });
  return relatedProducts;
}

function getCart(username) {
  return userData.find((user) => user.login.username == username).cart;
}

function findProduct(id) {
  return productData.find((product) => {
    return product.id === id;
  });
}

function addProduct(product, cart) {
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
        categoryId: product.categoryId,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
      return cart;
    }
  }
}

function findProductInCart(productId, userCart) {
  return userCart.find((item) => item.id === productId);
}

function deleteProduct(productId, userCart) {
  let itemToRemoveIndex = userCart.findIndex((item) => item.id === productId);
  userCart.splice(itemToRemoveIndex, 1);
  return userCart;
}

function updateProduct(productId, quantity, userCart) {
  let matchedItem = userCart.find((item) => {
    return item.id === productId;
  });
  matchedItem.quantity = quantity;
  return userCart;
}

module.exports = {
  getBrands,
  getBrandProducts,
  getAllProducts,
  getProducts,
  getCart,
  findProduct,
  addProduct,
  findProductInCart,
  deleteProduct,
  updateProduct,
};
