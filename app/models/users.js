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
}

module.exports = Users;