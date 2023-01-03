let users = [];
let cart = [];

class Users {
  constructor(params) {
    Object.assign(this, params);
  };
  
  //populates all the users into users variable
  static addUsers(_users){
    users = [..._users];
  };

//populate cart with user's object's cart
  static addCart(_user) {
    cart = [..._user.cart];
  }

  //find user by matching with paramter inputs
  static authenticateUser(_email,_password){
    const foundUser = users.find(user => {
      return user.email == _email && user.login.password == _password;
    })
    return foundUser;
  }

  //returns user's cart
  static getUserCart(){
    return cart;
  }

  //uses parameters to add input product to current user
  static addToUserCart(_product, _currentAccessToken){
    cart.push(_product);
    //update users cart in users object
    let currentUserIndex = users.findIndex((userObject) => {
      return userObject.login.username.length === _currentAccessToken.username.length;
    });
    users[currentUserIndex].cart = cart;
    return;
  };

  //uses parameters to delete an item from current user's cart
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