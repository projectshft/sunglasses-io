// Helper method to process access token
const getValidTokenFromRequest = request => {
    const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    const parsedUrl = require('url').parse(request.url, true);
    if (parsedUrl.query.accessToken) {
      // Verify the access token to make sure it's valid and not expired
      let currentAccessToken = accessTokens.find((accessToken) => {
        return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
      });
      if (currentAccessToken) {
        return currentAccessToken;
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  // const uid = require('rand-token').uid;
// const newAccessToken = uid(16); //use to create new tokens