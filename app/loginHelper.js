const Url = require('url');
const fs = require('fs');
const { uid } = require('rand-token');

const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));

const accessTokens = [{ username: 'greenlion235', token: '2NtI54rzGs6KEaSL' }];

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

const getTokenFromUsername = (username) => {
  const token = accessTokens.find(
    (accessToken) => accessToken.username === username
  );
  if (token) return token;
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

      const newAccessToken = {
        username: user.login.username,
        token: uid(16),
      };

      accessTokens.push(newAccessToken);
      return response.end(JSON.stringify(newAccessToken));
    }

    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
  response.writeHead(400, 'Incorrectly formatted response');
  return response.end();
};

module.exports = {
  loginHelper,
  getValidTokenFromRequest,
  getTokenFromUsername,
};
