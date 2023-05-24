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
  
  static findProduct(id) {
    let product = state.products.find((item) => {
      return item.id == id;
    });

    return product;
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

  static keywordFilter(array) {
    const search =  array.map(word => word.toLowerCase());
    
    const wordCount = search.reduce((accum, word) => {
      if(word === 'brand' || word === 'brands') {
        return { ...accum, brand: accum.brand + 1 }
      } else if(word === 'product' || word === 'products'){
        return { ...accum, product: accum.product + 1 }
      } else if(word === 'sunglasses'){
        return { ...accum, sunglasses: accum.sunglasses + 1 }
      } else {
        return accum
      }

    }, { brand: 0, product: 0, sunglasses: 0 });
    
    if(wordCount.brand > wordCount.product && wordCount.brand > wordCount.sunglasses) {
      return state.brands;
    } else if(wordCount.product > wordCount.brand || wordCount.sunglasses > wordCount.brand) {
      return state.products;
    } else {
      return null;
    }
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

  static removeCartItems(user, product) {
    const newCart = user.cart.filter((item) => {
      return item.id !== product.id;
    });

    let index = state.users.indexOf(user);
    state.users[index].cart = newCart;
    return newCart
  };

  static validateUser(username, password) {
    const findUser = state.users.find((user) => {
      return user.login.username == username && user.login.password == password;
    });

    return findUser;
  };

  static validateRemoval(cart, product){
    let valid = false;

    const check = cart.filter((item) => {
      return item.id == product.id;
    });

    if(check.length === 0) {
      valid = true;
    }

    return valid;
  };

}

module.exports = Sunglasses;