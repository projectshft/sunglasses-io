/**Helper functions related to authentication */

// An access token can look like this:
// {
//   username: 'bob',
//   lastUpdated: <A valid date>,
//   token: 'qwertyuiopasdfg1'
// }

const uid = require('rand-token').uid;

function generateToken(username) {
  const newToken = { username: username, lastUpdated: new Date(), token: uid(16) };
  return newToken;
}

function checkToken(accessTokens, token) {
	// Was a token provided?
	if (token === null) {
		return null;
	}
	// Was the token formatted correctly?
	// Does the token object have username, lastUpdated, and a token properties?

	// What's the age of the token?
	// currentTime = new Date();
	// What's the difference between token.lastUpdated and currentTime?
	// If greater than 8 hours, token is expired.

	// If token expired, require login.
	
  // Remove the 'Bearer ' value from the token
	const formattedToken = token.replace('Bearer ', '');
	
	// Is there a matching token?
	const matchingToken = accessTokens.find(existingToken => existingToken.token === formattedToken);
	
	return matchingToken;
	// TODO: Make tests for each scenario: no token, expired token, invalid token, and valid token.
}

module.exports = { generateToken, checkToken };