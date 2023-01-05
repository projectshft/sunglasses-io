const { uid } = require("rand-token");

const accessTokens = [];
// variable value for 15 minutes
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

class Tokens {
  constructor(params) {
    Object.assign(this, params);
  }

  //Look for access token and if present udpate the lastUpdated property
  //If no token found return undefined
  static findCurrent(_user){
    //look for current token by _user's username
    const _currentToken = accessTokens.find((accessToken)=> {
      return _user.login.username == accessToken.username;
    });

    //if there is a token then update lastUpdated property 
    if(_currentToken){
      _currentToken.lastUpdated = new Date();
      return _currentToken;
    } else{
      return _currentToken;
    }
  }

  //create a new token
  static createToken(_user) {
    const _newAccessToken = {
      username: _user.login.username,
      lastUpdated: new Date(),
      token: uid(16)
    }

    accessTokens.push(_newAccessToken);
    return _newAccessToken
  }
  
  //grabs the token value from request URL
  static getValidTokenFromRequest(_request) {
    const parsedUrl = require("url").parse(_request.url,true);
    //if access token is present in URL then find local state token
    
    if(parsedUrl.query.accessToken){
      //Find token and make sure it's not expired
      const currentAccessToken = accessTokens.find((accessToken)=> {
        return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
      });
      if(currentAccessToken) {
        return currentAccessToken;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

module.exports = Tokens;