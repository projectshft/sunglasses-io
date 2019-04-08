const fs = require('fs');
const { uid } = require('rand-token');
const { HEADERS } = require('./server.js');

// Bring in data
const users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'));
console.log(`Server setup: ${users.length} users loaded`);

const brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf8'));
console.log(`Server setup: ${brands.length} brands loaded`);

const products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf8'));
console.log(`Server setup: ${products.length} products loaded`);

// Login variables

// eslint-disable-next-line prefer-const
let accessTokens = [
  {
    username: 'yellowleopard753',
    lastUpdated: Date.now(),
    token: '12345'
  },
  {
    username: 'Harry the hacker',
    lastUpdated: Date.now(),
    token: 'abcde'
  },
  {
    username: 'lazywolf342',
    lastUpdated: Date.now(),
    token: '11111'
  },
  {
    username: 'greenlion235',
    lastUpdated: Date.now(),
    token: '00000'
  }
];

// *** Helper functions
const validateLogin = function(request, response) {
  const { email } = request.body;
  const { password } = request.body;
  // Check if email address has an associated user

  if (!email) {
    response.writeHead(400, 'Email is required', HEADERS);
    return response.end();
  }

  if (!password) {
    response.writeHead(400, 'Password is required', HEADERS);
    return response.end();
  }
  // See if there is a user that has that email and password
  const validUser = users.find(user => email === user.email && password === user.login.password);

  if (!validUser) {
    response.writeHead(401, 'Invalid email or password', HEADERS);
    return response.end();
  }

  return validUser;
};

const getCurrentToken = function(currentUser) {
  let currentToken = accessTokens.find(
    accessToken => accessToken.username === currentUser.login.username
  );

  if (currentToken) {
    if (Date.now() - currentToken.lastUpdated >= 900000) {
      // Update the last updated value of the existing token so we get another time period before expiration
      currentToken.lastUpdated = Date.now();
    }
  } else {
    // Create a new token with the user value and a "random" token
    currentToken = {
      username: currentUser.login.username,
      lastUpdated: Date.now(),
      token: uid(16)
    };
    accessTokens = [...accessTokens, currentToken];
  }
  return currentToken;
};

// Helper method to process access token
const getValidTokenFromRequest = function(request) {
  // Obtain token from header
  const tokenFromHeader = request.headers['x-access-token'];
  // Verify a token was passed in
  if (tokenFromHeader) {
    const currentToken = accessTokens.find(accessToken => accessToken.token === tokenFromHeader);
    // Verify the token isn't expired
    if (currentToken) {
      if (Date.now() - currentToken.lastUpdated <= 900000) {
        return currentToken;
      }
      return null;
    }
    return null;
  }
};

const getValidUserFromToken = function(token) {
  if (token) {
    const currentUser = users.find(user => user.login.username === token.username);
    return currentUser;
  }
  return null;
};

module.exports = {
  validateLogin,
  getCurrentToken,
  getValidTokenFromRequest,
  getValidUserFromToken,
  users,
  brands,
  products,
  accessTokens
};
