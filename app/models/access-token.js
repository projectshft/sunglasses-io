const { uid } = require("rand-token");

let accessTokens = [];

class Tokens {
  constructor(params) {
    Object.assign(this, params);
  }

  static findCurrent(_user){
    const _currentToken = accessTokens.find((tokenObject) => {
      return tokenObject.username == _user.login.username;
    })

    if(_currentToken){
      _currentToken.lastUpdated = new Date();
      return _currentToken;
    } else{
      return _currentToken;
    }
  }

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
}

module.exports = Tokens;