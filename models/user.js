let users = [];
let userCredentials = {
  email: 'rhaenyra@houseofdragon.com',
  password: 'iamqueen'
}

class User {
  constructor(params) {
    Object.assign(this, params);
  }

  static loginUser(userCredentials) {
    return users.find((user=>user.userCredentials === userCredentials))
  }
}
  