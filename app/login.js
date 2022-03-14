const Url = require('url');
const { uid } = require('rand-token');

const accessTokens = [];
const users = [];

const getValidTokenFromRequest = (request) => {
  const parsedUrl = Url.parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    const currentAccessToken = accessTokens.find(
      (accessToken) => accessToken.token === parsedUrl.query.accessToken
    );
    if (currentAccessToken) {
      return currentAccessToken;
    }
    return null;
  }
  return null;
};

const loginHelper = (request, response) => {
  if (request.body.username && request.body.password) {
    const user = users.find(
      (u) =>
        u.login.username === request.body.username &&
        u.login.password === request.body.password
    );

    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' });

      const currentAccessToken = accessTokens.find(
        (tokenObject) => tokenObject.username === user.login.username
      );

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      }
      // Create a new token with the user value and a "random" token
      const newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      accessTokens.push(newAccessToken);
      return response.end(JSON.stringify(newAccessToken.token));
    }

    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
  response.writeHead(400, 'Incorrectly formatted response');
  return response.end();
};

module.exports = { getValidTokenFromRequest, loginHelper };
