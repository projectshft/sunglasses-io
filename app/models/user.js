// OKAY SO NOT SURE IF I NEED ANYTHING OTHER THAN getALL

var fs = require('fs');

let users = [];

fs.readFile("/Users/StephB/code/node-js/sunglasses-io/initial-data/users.json", "utf8", (error, data) => {
  if (error) throw error;
  users = JSON.parse(data);
  console.log(`Server setup: ${users.length} stores loaded`);
});

class User {
  constructor(params) {
    Object.assign(this.params);
  }

  static addUser(newUser) {
    users.push(newUser)
    return newUser;
  }

  static removeAll() {
    users = [];
  }

  static remove(usernameToRemove) {
    users = users.filter((user=>user.login.username != usernameToRemove))
  }

  static getUser(username) {
    return users.find((user=>user.login.username == username))
  }

  // using
  static getAll() {
    return users
  }

  static updateUser(user, updatedUser) {
    Object.assign(user, updatedUser);
    return user;
  }

  // add update cart?
} 

//Exports the Product for use elsewhere.
module.exports = User;