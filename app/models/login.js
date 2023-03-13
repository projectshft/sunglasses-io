let users = [];

class User {
  constructor(params) {
    Object.assign(this,params);
  }

} 

//Exports the Book for use elsewhere.
module.exports = User;