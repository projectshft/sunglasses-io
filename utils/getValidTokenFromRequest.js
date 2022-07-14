const { urlBase } = require('../utils/url');
const accessTokens = require('../utils/accessTokens');

const getValidTokenFromRequest = (req) => {

  const TOKEN_VALIDITY_TIMEOUT = 900000;
  
  const currentUrl = urlBase + req.url;
  const myURL = new URL(currentUrl);
  const reqAccessToken = myURL.searchParams.get('accessToken')


  let currentAccessToken = accessTokens.find(tokenObject => {
    return reqAccessToken == tokenObject.accessToken;
  }) 

  const newDate = Math.abs(new Date())
  const currentAccessTokenLastUpdated = currentAccessToken.lastUpdated;
  const timeSinceLastUpdated = newDate - currentAccessTokenLastUpdated;

  const accessTokenStillValid = (limit, span) => {
    if (span < limit) {
      return true;
    } else {
      return false;
    }
  }

  if (!currentAccessToken) {
    return 'no currenct access token';
  } else if (!accessTokenStillValid(TOKEN_VALIDITY_TIMEOUT, timeSinceLastUpdated)) {
      return 'access token has expired'
    } else {
      return "You're in!"
    }
}


module.exports = getValidTokenFromRequest;

/*
mesh true false statements together with tests
  no current access token – 'no currenct access token'
  correct current access token, but not valid – 'access token has expired'
  correct access token, and up to date – "You're in!"
  
add return methods
*/