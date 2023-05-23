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
  };

  static filterProductInCart(userName, product) {
    const user = Sunglasses.findUser(userName);

    const specificProductArr = user.cart.filter((item) => {
      return item.id == product.id;
    });

    return specificProductArr
  };

  static updateCartAdd(userName, quantity, product) {
    const user = Sunglasses.findUser(userName);

    for (let i = 1; i <= quantity; i++) {
      user.cart.push(product);
    }

    return user.cart;
  };

  static updateCartSub(userName, quantity, product) {
    const user = Sunglasses.findUser(userName);

    const reduceCart = user.cart.reduce((accumulator, currentItem) => {
      let productsInAccum = accumulator.filter((item) => {
        return item.id == product.id;
      });

      if(currentItem.id == product.id && productsInAccum.length < quantity){
        accumulator.push(currentItem);
      }

      if(currentItem.id !== product.id) {
        accumulator.push(currentItem);
      }

      return accumulator;
    }, []);

    let index = state.users.indexOf(user);

    state.users[index].cart = reduceCart;

    return reduceCart;
  };

}

module.exports = Sunglasses;