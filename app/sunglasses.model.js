const state = {
  products: [],
  users: [],
  brands: []
}

class Sunglasses {
  constructor(params) {
    Object.assign(this, params);
  };

  static setState(currentState) {
    state.products = currentState.products;
    state.users = currentState.users;
    state.brands = currentState.brands;
  }; 

  static getAllBrands() {
    return state.brands;
  };

  static findBrand(id) {
    const brand = state.brands.find((brand) => {
      return brand.id == id;
    });

    return brand;
  };

  static findUser(userName) {
    const user = state.users.find((user) => {
      return user.login.username == userName;
    });
    
    return user;
  };

  static filterProducts(id) {
    const products = state.products.filter((product) => {
      return product.categoryId == id;
    })

    return products;
  };

  static getProducts() {
    return state.products;
  };

  static addToCart(user, product) {
    user.cart.push(product);
    return user.cart
  }

}

module.exports = Sunglasses;