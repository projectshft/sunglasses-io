let users = [];
let cart = [];

class Users {
  constructor(params) {
    Object.assign(this, params);
  };

  static addUsers(_users){
    users = [..._users];
    cart = [];
  };

  static addCart(_user) {
    cart = [];
    cart = [..._user.cart];
  }

  static authenticateUser(_email,_password){
    const foundUser = users.find(user => {
      return user.email == _email && user.login.password == _password;
    })
    return foundUser;
  }

  static getUserCart(){
    return cart;
  }

  static addToUserCart(_product, _currentAccessToken){
    cart.push(_product);
  };

  static deleteFromUserCart(_id, _currentAccessToken){
    // let currentUserIndex = users.findIndex((userObject) => {
    //   return userObject.login.username = _currentAccessToken.username;
    // })
    const itemtoDelete = cart.filter(cartObject => {
      return parseInt(cartObject.id) === parseInt(_id);
    })
    if(itemtoDelete.length == 0){
      return null;
    }
    else{
      const filteredCart = cart.filter(cartObject => {
        return parseInt(cartObject.id) !== parseInt(_id)
      })
      return cart = filteredCart;
    }
  }
}

module.exports = Users;