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

  console.log(TOKEN_VALIDITY_TIMEOUT);
  
  if (currentAccessToken) {
    return true;
  } else {
    return false;
  }
}

module.exports = getValidTokenFromRequest;