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

  console.log(`newDateAbsolute: ${newDate}`)
  console.log(`currentAccessTokenLastUpdated: ${currentAccessTokenLastUpdated}`);
  
  

  
  if (currentAccessToken) {
    return true;
  } else {
    return false;
  }
}

module.exports = getValidTokenFromRequest;