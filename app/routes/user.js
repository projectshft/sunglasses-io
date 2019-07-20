var fs = require('fs');
let users = [];
users = JSON.parse(fs.readFileSync("../../initial-data/users.json", "utf-8"));

const getUsers = () => {
    return users;
}

module.exports = {getUsers};