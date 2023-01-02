let users = [];

class Users {
  constructor(params) {
    Object.assign(this, params);
  };

  static addUsers(_users){
    users = [..._users]
  };

  static authenticateUser(_email,_password){
    const foundUser = users.find(user => {
      return user.email == _email && user.login.password == _password;
    })
    return foundUser;
  }

  static addToUserCart(_product, _currentAccessToken){
    const currentUser = users.find((userObject) => userObject.login.username == _currentAccessToken.username);
    currentUser.cart.push(_product);
  };

  static getUserCart(_currentAccessToken){
    const currentUser = users.find((userObject) => userObject.login.username == _currentAccessToken.username);
    return currentUser.cart;
  }

  static deleteFromUserCart(_id, _currentAccessToken){
    const currentUser = users.find((userObject) => userObject.login.username == _currentAccessToken.username);
    currentUser.cart = currentUser.cart.filter(productObject => {
      productObject.id !== _id
    })
  }
}

module.exports = Users;