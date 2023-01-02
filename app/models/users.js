let users = [];
let accessTokens = [];

class Users {
  constructor(params) {
    Object.assign(this, params);
  };

  static addUsers(_users){
    users = [..._users]
  };

  static authenticatedUser(_email,_password){
    foundUser = users.find(user => {
      user.email === _email && user.login.password === _password;
    })
    return foundUser;
  }
}

module.exports = Users;