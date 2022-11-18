let User = require('../models/user');

function loginUser (req, res) {
  res.send(User.loginUser())
};

module.exports = { loginUser };