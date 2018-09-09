'use strict';


/**
 * User login
 * The User Login endpoint allows an existing user to sign in.
 *
 * username String username and pw return access token
 * password String username and pw return access token
 * returns Login
 **/
exports.userLogin = function(username,password) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "password" : "password",
  "username" : "username"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

