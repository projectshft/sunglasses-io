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

  const newDate = new Date();
  const newDateAbsolute = Math.abs(new Date())

  console.log(`newDate raw: ${newDate}`)
  console.log(`newDateAbsolute: ${newDateAbsolute}`)
  console.log(`currentAccessToken.lastUpated as is: ${currentAccessToken.lastUpdated}`)
  console.log(`currentAccessToken.lastUpdate absolutized: ${Math.abs(currentAccessToken.lastUpdated)}`)
  

  
  if (currentAccessToken) {
    return true;
  } else {
    return false;
  }
}

module.exports = getValidTokenFromRequest;