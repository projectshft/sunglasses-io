const brandData = require("../initial-data/brands.json");
const productData = require("../initial-data/products.json");
const userData = require("../initial-data/users.json");
const uid = require("rand-token").uid;

function getNumOfFailedLoginRequestsForUsername(username, failedLoginAttempts) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  }
}

function increaseNumFailedAttemptsForUser(numFailedAttemptsForUser) {
  return numFailedAttemptsForUser + 1;
}

function getValidTokenFromRequest(request, accessTokens) {
  const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;
  const token = request.headers["access-token"];
  if (token) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == token &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
    });
    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function findUserWithUsernameAndPassword(username, password) {
  return userData.find((user) => {
    return user.login.username == username && user.login.password == password;
  });
}

function findAccessToken(username, accessTokens) {
  return accessTokens.find((tokenObject) => {
    return tokenObject.username == username;
  });
}

function createNewAccessToken(username) {
  return {
    username: username,
    lastUpdated: new Date(),
    token: uid(16),
  };
}

module.exports = {
  getNumOfFailedLoginRequestsForUsername,
  createNewAccessToken,
  findAccessToken,
  findUserWithUsernameAndPassword,
  getValidTokenFromRequest,
  increaseNumFailedAttemptsForUser,
};
