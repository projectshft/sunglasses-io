let users = [];
let currentId = 1;

class User {
  constructor(params) {
    Object.assign(this,params);
  }

  static addUsers(newUsersArr) {
    newUsersArr.forEach(newUser => {
      this.addUser(newUser);
    });
  }

  static addUser(newUser) {
    newUser.id = currentId.toString();
    currentId++;
    users.push(newUser)
    return newUser;
  }

  static getAll() {
    return users
  }

  static removeAll() {
    users = [];
  }

  static resetId() {
    currentId = 1;
  }
  
  static validateUsernameAndPassword(username, password) {}
}

module.exports = User;