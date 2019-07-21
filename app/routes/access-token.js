//Separated routes trying to improve readability in the server.js file
let accessTokens = [{
  email: "susanna.richards@example.com",
  lastUpdated: new Date(),
  token: '1234567890123456'
}];

let uid = require("rand-token").uid;

//Function to find the token and update it if it exists
const findToken = sentUser => {
  let foundToken = accessTokens.find(token => {
    return token.email == sentUser.email;
  });
  if (foundToken) {
    foundToken.lastUpdated = new Date();
  }

  return foundToken;
};

//Function to add a new token to the array and return the token
const addToken = sentUser => {
  let newAccessToken = {
    email: sentUser.email,
    lastUpdated: new Date(),
    token: uid(16)
  };
  accessTokens.push(newAccessToken);
  return newAccessToken;
};

//Function to find a user's email by provided token
const findUserByToken = sentToken => {
  let foundUser = accessTokens.find(token => {
    return token.token == sentToken;
  });
  if (foundUser) {
    return foundUser.email
  }
  return null;
};

module.exports = { findToken, addToken, findUserByToken };
