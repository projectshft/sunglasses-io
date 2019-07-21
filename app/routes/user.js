//Separated routes trying to improve readability in the server.js file
var fs = require("fs");

let users = [];
users = JSON.parse(fs.readFileSync("../../initial-data/users.json", "utf-8"));

// Function to return all of the users
const getUsers = () => {
  return users;
};

//Function to find a user by email
const findUserByEmail = (email) => {
  return users.find(user => {
    return user.email == email;
  });
};

module.exports = { getUsers, findUserByEmail };
