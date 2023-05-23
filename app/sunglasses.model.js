// const state = {
//   products: [],
//   users: [],
//   brands: []
// }

class Sunglasses {
  constructor(params) {
    Object.assign(this, params);
  };


  // static setState(currentState) {
  //   state.products = currentState.products;
  //   state.users = currentState.users;
  //   state.brands = currentState.brands;
  // }; might use if we can get it to work

  static getAllBrands(state) {
    return state.brands;
  };

  static findBrand(state, id) {
    const brand = state.brands.find((brand) => {
      return brand.id == id;
    });

    return brand;
  };

  static findUser(state, userName) {
    const user = state.users.find((user) => {
      return user.login.username == userName;
    });
    
    return user;
  };

  static filterProducts(state, id) {
    const products = state.products.filter((product) => {
      return product.categoryId == id;
    })

    return products;
  };

  static getProducts(state) {
    return state.products;
  };

  static addToCart(user, product) {
    user.cart.push(product);
    return user.cart
  }

}

module.exports = Sunglasses;