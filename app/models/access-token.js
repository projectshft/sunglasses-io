const { access } = require("fs");
const { uid } = require("rand-token");

let accessTokens = [];
// variable value for 15 minutes
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

class Tokens {
  constructor(params) {
    Object.assign(this, params);
  }

  static findCurrent(_user){
    //look for current token by user's username
    let _currentToken = accessTokens.find((accessToken)=> {
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
    let _newAccessToken = {
      username: _user.login.username,
      lastUpdated: new Date(),
      token: uid(16)
    }
    return _newAccessToken
  }

  static pushNewTokenToAccessTokens(_newAccessToken){
    accessTokens.push(_newAccessToken);
  }

  static getValidTokenFromRequest(_request) {
    let parsedUrl = require("url").parse(_request.url,true);
    //if access token is present in URL then find local state token
    if(parsedUrl.query.accessToken){
      //Find token and make sure it's not expired
      let currentAccessToken = accessTokens.find((accessToken)=> {
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