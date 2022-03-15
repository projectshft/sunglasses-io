const fs = require('fs');

const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));

let accesstoken;

class Login {
  constructor(params) {
    Object.assign(this, params);
  }

  static clearToken() {
    accesstoken = {};
  }

  static login(token) {
    accesstoken = token;
    return accesstoken;
  }
}

module.exports = Login;
