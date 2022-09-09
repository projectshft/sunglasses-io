let users = require('../../initial-data/users.json')

class User {
  constructor(params){
    Object.assign(this, params)
  }

  static getUser(userId) {
    return users.find((user=> user.name.first == userId))
  }


}

module.exports = User