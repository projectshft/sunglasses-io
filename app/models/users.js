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
    //update users cart in users object
    let currentUserIndex = users.findIndex((userObject) => {
      return userObject.login.username.length === _currentAccessToken.username.length;
    });
    users[currentUserIndex].cart = cart;
    return;
  };

  static deleteFromUserCart(_id, _currentAccessToken){
    let currentUserIndex = users.findIndex((userObject) => {
      return userObject.login.username.length === _currentAccessToken.username.length;
    });
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
      
      //update users cart in users object
      users[currentUserIndex].cart = filteredCart;
      return cart = filteredCart;
    }
  }
}

module.exports = Users;