let users = [];
let currentId = 1;

class User {
  constructor(params) {
    Object.assign(this,params);
  }
  
  static validateUsernameAndPassword(username, password) {}
}

module.exports = User;