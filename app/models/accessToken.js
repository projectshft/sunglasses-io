let accessToken = [
  {
    username: 'yellowleopard753',
    lastUpdated: new Date(),
    token: '1111111111111111'
  }];

class AccessToken {
  constructor(params) {
    Object.assign(this.params);
  }

  static addToken(newToken) {
    accessToken.push(newToken)
    return newToken;
  }

  static removeAll() {
    accessToken = [];
  }

  static remove(tokenUserNameToRemove) {
    accessToken = accessToken.filter((token=>token.username != tokenUserNameToRemove))
  }

  static getToken(tokenUserName) {
    return accessToken.find((token=>token.username == tokenUserName))
  }

  static getAll() {
    return accessToken
  }

  static updateToken(token, updatedToken) {
    Object.assign(token, updatedToken);
    return token;
  }
} 

//Exports the Book for use elsewhere.
module.exports = AccessToken;
