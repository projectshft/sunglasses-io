'use strict';

var utils = require('../utils/writer.js');
var Login = require('../service/LoginService');

module.exports.userLogin = function userLogin (req, res, next) {
  var username = req.swagger.params['username'].value;
  var password = req.swagger.params['password'].value;
  Login.userLogin(username,password)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
