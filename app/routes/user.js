//Separated routes trying to improve readability in the server.js file
var fs = require("fs");

let users = [];
users = JSON.parse(fs.readFileSync("../../initial-data/users.json", "utf-8"));

// Function to return all of the
const getUsers = () => {
  return users;
};

module.exports = { getUsers };
