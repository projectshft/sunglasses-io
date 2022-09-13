let users = require('../../initial-data/users.json')

class User {
  constructor(params){
    Object.assign(this, params)
  }

  static getUserInfo(username) {
    let user = users.find((user=> {
      user.login.username == username }))
    return user
    }
  



}

module.exports = User